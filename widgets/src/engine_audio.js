import * as Tone from "tone";


//  ==================================================================
//  ======================= Event Schedulers =========================
//  ==================================================================


export class EventTimelinePlayer {
    constructor(model, sampler) {
        this.model = model;
        this.sampler = sampler;
    };

    // Play Currently Stored Timeline [Pitch, Velocity, Duration, StartTime]
    scheduleTimeline(timeline) {        
        if (!this.sampler) return;

        Tone.Transport.stop();
        Tone.Transport.cancel();

        for (const event of timeline) {

            const [pitch, velocity, duration, start_time] = event;
            
            Tone.Transport.schedule((time) => {
                this.sampler.triggerAttackRelease(
                    Tone.Frequency(pitch,"midi").toNote(),
                    duration,
                    time,
                    velocity / 127
                );
            }, start_time);

        }
        Tone.Transport.start();
    }

}



export class EventStreamPlayer {
    constructor(model, sampler) {

        this.model = model;
        this.sampler = sampler;
        this.active = false;
        this.waitingForChunk = false;
        this.refillTimer = null;
        this.scheduledUntil = 0;

        this.chunkSize = 4;
        this.lookahead = 2;

        // Track Tone Transport event IDs
        this.scheduledEventIds = [];

        // receive Python chunks
        this.model.on("change:chunk", () => {
            const chunk = this.model.get("chunk");
            console.log(chunk.events)
            this.receiveChunk(chunk.events);
        });
    }

    
    // PUBLIC API
    start() {

        if (this.active) return;

        console.log("Starting stream player");

        this.active = true;
        this.waitingForChunk = false;
        this.scheduledUntil = 0;

        this.scheduledEventIds = [];

        Tone.Transport.stop();
        Tone.Transport.cancel();

        this.requestChunk();
        Tone.Transport.start();
    }

    stop() {

        console.log("Stopping stream player");

        this.active = false;
        this.waitingForChunk = false;

        if (this.refillTimer) {
            clearTimeout(this.refillTimer);
            this.refillTimer = null;
        }

        // Explicit cleanup
        for (const evt of this.scheduledEventIds) {
            Tone.Transport.clear(evt.id);
        }

        this.scheduledEventIds = [];

        Tone.Transport.stop();
        Tone.Transport.cancel();

        this.scheduledUntil = 0;
    }

    
    // PYTHON COMMUNICATION    
    requestChunk() {

        if (!this.active) return;
        if (this.waitingForChunk) return;

        console.log("JS: Requesting chunk");

        this.waitingForChunk = true;

        this.model.set("event", {
            type: "request_chunk",
            n: this.chunkSize,
            timestamp: Date.now()
        });

        this.model.save_changes();

        console.log("JS: requested!");
    }

    receiveChunk(chunk) {
        if (!this.active) return;

        // if (!chunk || chunk.length === 0) {
        //     console.warn("Ignoring empty chunk");    
        //     return;
        // }

        console.log("JS: Received chunk", chunk);
        this.waitingForChunk = false;
        this.scheduleChunk(chunk);
    }

    
    // EVENT CLEANUP
    cleanupOldEvents() {

        const current = Tone.Transport.seconds;
        const keep = [];
        for (const evt of this.scheduledEventIds) {

            // Remove events that are safely in the past
            if (evt.time < current - 1) {
                Tone.Transport.clear(evt.id);
            } else {
                keep.push(evt);
            }
        }

        this.scheduledEventIds = keep;

        // Debugging
        console.log(
            "Active scheduled events:",
            this.scheduledEventIds.length
        );
    }

    

    // SCHEDULING    
    scheduleChunk(chunk) {

        this.cleanupOldEvents();

        let localTime = this.scheduledUntil;

        for (const event of chunk) {

            const [pitch, velocity, duration, delta] = event;  
            const id = Tone.Transport.schedule((time) => {

                this.sampler.triggerAttackRelease(
                    Tone.Frequency(pitch, "midi").toNote(),
                    duration,
                    time,
                    velocity / 127
                );

            }, localTime);

            this.scheduledEventIds.push({id, time: localTime});
            localTime += delta;
        }

        this.scheduledUntil = localTime;

        this.scheduleRefillWakeup();
    }

    // =========================================================
    // REFILL TIMING
    // =========================================================

    scheduleRefillWakeup() {

        if (!this.active) return;

        if (this.refillTimer) {
            clearTimeout(this.refillTimer);
            this.refillTimer = null;
        }

        const current = Tone.Transport.seconds;

        const timeUntilRefill =
            this.scheduledUntil - this.lookahead - current;

        const delayMs =
            Math.max(0, timeUntilRefill * 1000);

        this.refillTimer = setTimeout(() => {
            if (!this.active) return;
            this.requestChunk();
        }, delayMs);
    }
}


