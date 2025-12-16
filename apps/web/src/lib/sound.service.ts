// Sound effects using Web Audio API
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
    if (!audioContext) {
        audioContext = new AudioContext();
    }
    return audioContext;
}

export function playNotificationSound(type: "success" | "warning" | "info" = "success") {
    try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Different tones for different notification types
        const frequencies: Record<string, number[]> = {
            success: [523.25, 659.25, 783.99], // C5, E5, G5 (major chord arpeggio)
            warning: [440, 349.23, 440], // A4, F4, A4
            info: [523.25, 587.33], // C5, D5
        };

        const freqs = frequencies[type];
        const duration = 0.12;
        const now = ctx.currentTime;

        gainNode.gain.setValueAtTime(0.15, now);

        freqs.forEach((freq, i) => {
            oscillator.frequency.setValueAtTime(freq, now + i * duration);
        });

        gainNode.gain.exponentialRampToValueAtTime(0.01, now + freqs.length * duration);

        oscillator.start(now);
        oscillator.stop(now + freqs.length * duration);
    } catch (e) {
        console.warn("Could not play notification sound:", e);
    }
}

export async function requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
        console.warn("This browser does not support notifications");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
}

export function showBrowserNotification(title: string, body: string, icon?: string) {
    if (Notification.permission === "granted") {
        const notification = new Notification(title, {
            body,
            icon: icon || "/favicon.ico",
            badge: "/favicon.ico",
            tag: "metricflow-alert",
            requireInteraction: false,
        });

        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);

        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    }
}
