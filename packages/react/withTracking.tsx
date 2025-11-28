import { useComponentTracking } from "./hooks/useComponentTracking";

export function withTracking<P extends object>(Component: React.ComponentType<P>, componentName: string) {
    return function TrackedComponent(props: P) {
        useComponentTracking(componentName);
        return <Component {...props} />;
    };
}
