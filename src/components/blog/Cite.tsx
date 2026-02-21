"use client"

import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { useEffect, useState, type ReactNode, Fragment } from "react";

interface MdxCiteProps {
    bibKey: string | string[]
}

function CiteContent({ citationKey }: { citationKey: string }) {
    const [element, setElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const value = window.document.getElementById(`${citationKey}`);
        if (value != null) {
            setElement(value);
        }
    }, [citationKey])

    if (!element) {
        return null;
    }

    let content: ReactNode = null;
    if (element.firstElementChild) {
        content = element.firstElementChild.innerHTML;
    }

    return (
        <HoverCardContent className="text-xs text-wrap bg-accent">
            <div dangerouslySetInnerHTML={{ __html: content as string }} />
        </HoverCardContent>
    );
}

function CiteNumber({ citationKey }: { citationKey: string }) {
    const [element, setElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const value = window.document.getElementById(`${citationKey}`);
        if (value != null) {
            setElement(value);
        }
    }, [citationKey]);

    if (!element) {
        return null;
    }

    const idx = element.ariaLabel;
    return <>{idx ? Number(idx) + 1 : ''}</>;
}

function SingleCite({ citationKey }: { citationKey: string }) {
    return (
        <HoverCard openDelay={300}>
            <span>
                [<HoverCardTrigger
                    className="no-underline"
                    href={`#${citationKey}`}
                >
                    <CiteNumber citationKey={citationKey} />
                </HoverCardTrigger>]
            </span>
            <CiteContent citationKey={citationKey} />
        </HoverCard>
    );
}

export default function Cite({ bibKey }: MdxCiteProps) {
    if (!Array.isArray(bibKey)) {
        return <SingleCite citationKey={bibKey.toString()} />;
    } else {
        return (
            <span>
                [{bibKey.map((key, index) => (
                    <Fragment key={key}>
                        <HoverCard openDelay={100}>
                            <HoverCardTrigger className="no-underline" href={`#${key}`}>
                                <CiteNumber citationKey={key} />
                            </HoverCardTrigger>
                            <CiteContent citationKey={key.toString()} />
                        </HoverCard>
                        {index < bibKey.length - 1 && ", "}
                    </Fragment>
                ))}]
            </span>
        );
    }
}