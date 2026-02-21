// ref: https://github.com/letelete/letelete.github.io/blob/master/src/components/ui/organisms/highlighted-with-popup/index.tsx#L69

// Modified version with optional popup prop
import {
    AnimatePresence,
    type HTMLMotionProps,
    MotionConfig,
    type SpringOptions,
    motion,
    useSpring,
} from 'framer-motion';
import {
    type PropsWithChildren,
    type MouseEvent as ReactMouseEvent,
    type ReactNode,
    useRef,
    useState,
} from 'react';

import { Video, type VideoProps } from "@/components/vendor/video";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------------------------------
 * Highlighted
 * -----------------------------------------------------------------------------------------------*/

const getRelativeCoordinates = <
    T extends HTMLElement = HTMLElement,
    E = MouseEvent,
>(
    event: ReactMouseEvent<T, E>,
    referenceElement: T
) => {
    const position = {
        x: event.pageX,
        y: event.pageY,
    };

    const offset = {
        left: referenceElement.offsetLeft,
        top: referenceElement.offsetTop,
        width: referenceElement.clientWidth,
        height: referenceElement.clientHeight,
    };

    return {
        x: position.x - offset.left,
        y: position.y - offset.top,
        width: offset.width,
        height: offset.height,
        centerX: (position.x - offset.left - offset.width / 2) / (offset.width / 2),
        centerY:
            (position.y - offset.top - offset.height / 2) / (offset.height / 2),
    };
};

/* -----------------------------------------------------------------------------------------------*/

const popupPositionSpringConfig = {
    bounce: 0,
    stiffness: 100,
    mass: 0.1,
} as const satisfies SpringOptions;

interface HighlightedWithPopupProps extends HTMLMotionProps<'div'> {
    popup?: ReactNode; // Made optional
    popupContainerClassName?: string;
}

const HighlightedWithPopup = ({
    children,
    className,
    popupContainerClassName,
    popup,
    ...rest
}: PropsWithChildren<HighlightedWithPopupProps>) => {
    const [hovering, setHovering] = useState(false);
    const containerRef = useRef<HTMLSpanElement>(null);
    const popupRef = useRef<HTMLSpanElement>(null);

    const x = useSpring(0, popupPositionSpringConfig);
    const y = useSpring(0, popupPositionSpringConfig);

    return (
        <MotionConfig transition={{ type: 'spring', duration: 0.3, bounce: 0 }}>
            <motion.span
                ref={containerRef}
                onMouseMove={(e) => {
                    if (containerRef.current && popupRef.current) {
                        const mousePosition = getRelativeCoordinates(
                            e,
                            containerRef.current
                        );
                        x.set(mousePosition.x);
                        y.set(mousePosition.y);
                    }
                }}
                onHoverStart={() => setHovering(true)}
                onHoverEnd={() => setHovering(false)}
                className={cn("relative z-0 inline-block", className)}
                style={{
                    cursor: hovering ? 'nw-resize' : 'auto',
                }}
                {...rest}
            >
                <motion.span
                    animate={{
                        scale: 1,
                        height: hovering ? 2 : '100%',
                    }}
                    className='inset absolute bottom-0 left-0 z-0 block w-full bg-ctx-accent-primary'
                />

                <span className='relative z-10'>{children}</span>

                <AnimatePresence>
                    {hovering && popup && ( // Added popup check
                        <motion.span
                            ref={popupRef}
                            aria-hidden
                            initial={{ opacity: 0, scale: 0.2, borderRadius: 0 }}
                            animate={{ opacity: 1, scale: 1, borderRadius: 13 }}
                            exit={{ opacity: 0, scale: 0.2, borderRadius: 0 }}
                            className={cn(
                                'pointer-events-none absolute bottom-full right-full z-10 m-2 block aspect-square w-32 origin-bottom-right overflow-hidden bg-ctx-secondary',
                                popupContainerClassName
                            )}
                            style={{ x, y }}
                        >
                            {popup}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.span>
        </MotionConfig>
    );
};

HighlightedWithPopup.displayName = 'HighlightedWithPopup';

/* -------------------------------------------------------------------------------------------------
 * PopupVideoContent
 * -----------------------------------------------------------------------------------------------*/

interface PopupVideoContentProps extends VideoProps { }

/* -----------------------------------------------------------------------------------------------*/

export { HighlightedWithPopup };
export type { HighlightedWithPopupProps, PopupVideoContentProps };