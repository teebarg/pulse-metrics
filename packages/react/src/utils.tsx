import { JSX, ReactNode, useEffect, useRef, useState } from "react";
import { EventProperties } from "./types";
import { useAnalytics } from "./hooks/useAnalytics";

/**
 * Track clicks on any element
 */
interface TrackClickProps {
    event: string;
    properties?: EventProperties;
    children: ReactNode;
    as?: keyof JSX.IntrinsicElements;
    [key: string]: any;
}

export function TrackClick({ event, properties, children, as: Element = "div", ...props }: TrackClickProps) {
    const { track } = useAnalytics();

    const handleClick = (e: React.MouseEvent) => {
        track(event, properties);
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
    properties?: EventProperties;
    children: ReactNode;
    threshold?: number;
}

export function TrackVisibility({ event, properties, children, threshold = 0.5 }: TrackVisibilityProps) {
    const { track } = useAnalytics();
    const ref = useRef<HTMLDivElement>(null);
    const [hasTracked, setHasTracked] = useState(false);

    useEffect(() => {
        if (!ref.current || hasTracked) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasTracked) {
                    track(event, properties);
                    setHasTracked(true);
                }
            },
            { threshold }
        );

        observer.observe(ref.current);

        return () => observer.disconnect();
    }, [event, properties, threshold, hasTracked, track]);

    return <div ref={ref}>{children}</div>;
}
