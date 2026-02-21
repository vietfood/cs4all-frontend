// ref: https://github.com/letelete/letelete.github.io/blob/master/src/components/ui/atoms/dynamic-weight-on-hover-text/index.tsx

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { type HTMLMotionProps, motion } from 'framer-motion';
import { type PropsWithChildren, useId } from 'react';

/* -------------------------------------------------------------------------------------------------
 * DynamicWeightOnHoverText
 * -----------------------------------------------------------------------------------------------*/

interface DynamicWeightOnHoverTextProps
    extends Omit<HTMLMotionProps<'span'>, 'children'> {
    text: string;
    weight?: number;
}

const DynamicWeightOnHoverText = ({
    text,
    weight = 500,
    ...rest
}: PropsWithChildren<DynamicWeightOnHoverTextProps>) => {
    const id = useId();

    return (
        <>
            {text.split('').map((char, idx) => (
                <motion.span
                    key={`${id}:${char}:${idx}`}
                    whileHover={{
                        fontWeight: weight,
                        fontStyle: "italic",
                        transition: { type: 'spring', duration: 0.5, bounce: 0 },
                    }}
                    transition={{ type: 'spring', duration: 1, bounce: 0 }}
                    aria-hidden
                    {...rest}
                >
                    {char}
                </motion.span>
            ))}
            <VisuallyHidden>{text}</VisuallyHidden>
        </>
    );
};

DynamicWeightOnHoverText.displayName = 'DynamicWeightOnHoverText';

/* -----------------------------------------------------------------------------------------------*/

export { DynamicWeightOnHoverText };
export type { DynamicWeightOnHoverTextProps };