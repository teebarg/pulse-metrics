import React, { JSX, ReactNode, useEffect, useRef, useState } from "react";
import { EventMetadata } from "./types";
import { useAnalytics } from "./hooks/useAnalytics";

/**
 * Track clicks on any element
 */
interface TrackClickProps {
    event: string;
    metadata?: EventMetadata;
    children: ReactNode;
    as?: keyof JSX.IntrinsicElements;
    [key: string]: any;
}

export function TrackClick({ event, metadata, children, as: Element = "div", ...props }: TrackClickProps) {
    const { track } = useAnalytics();

    const handleClick = (e: React.MouseEvent) => {
        track(event, metadata);
        props.onClick?.(e);
    };

    return (
        <Element {...props} onClick={handleClick}>
            {children}
        </Element>
    );
}

/**
 * Track element visibility (intersection observer)
 */
interface TrackVisibilityProps {
    event: string;
    metadata?: EventMetadata;
    children: ReactNode;
    threshold?: number;
}

export function TrackVisibility({ event, metadata, children, threshold = 0.5 }: TrackVisibilityProps) {
    const { track } = useAnalytics();
    const ref = useRef<HTMLDivElement>(null);
    const [hasTracked, setHasTracked] = useState(false);

    useEffect(() => {
        if (!ref.current || hasTracked) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasTracked) {
                    track(event, metadata);
                    setHasTracked(true);
                }
            },
            { threshold }
        );

        observer.observe(ref.current);

        return () => observer.disconnect();
    }, [event, metadata, threshold, hasTracked, track]);

    return <div ref={ref}>{children}</div>;
}
