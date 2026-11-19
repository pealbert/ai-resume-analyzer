import type { ReactNode } from "react";

import { cn } from "~/lib/utils";

interface AccordionProps {
	children: ReactNode;
	className?: string;
}

export const Accordion = ({ children, className }: AccordionProps) => (
	<div aria-label="Resume feedback categories" className={cn("space-y-2", className)}>
		{children}
	</div>
);

interface AccordionItemProps {
	children: ReactNode;
	className?: string;
}

export const AccordionItem = ({ children, className }: AccordionItemProps) => (
	<details className={cn("group overflow-hidden border-b border-gray-200", className)}>
		{children}
	</details>
);

interface AccordionHeaderProps {
	children: ReactNode;
	className?: string;
	icon?: ReactNode;
	iconPosition?: "left" | "right";
}

export const AccordionHeader = ({
	children,
	className,
	icon,
	iconPosition = "left",
}: AccordionHeaderProps) => {
	const defaultIcon = (
		<svg
			aria-hidden="true"
			className="size-5 shrink-0 -rotate-90 text-gray-500 transition-transform duration-200 group-open:rotate-0 motion-reduce:transition-none"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
		</svg>
	);

	return (
		<summary
			className={cn(
				"flex min-h-12 cursor-pointer list-none items-center gap-3 rounded-lg px-2 py-3 text-left transition-colors marker:content-none hover:bg-gray-50 sm:px-4",
				className,
			)}
		>
			{iconPosition === "left" ? (icon ?? defaultIcon) : null}
			<div className="min-w-0 flex-1">{children}</div>
			{iconPosition === "right" ? (icon ?? defaultIcon) : null}
		</summary>
	);
};

interface AccordionContentProps {
	children: ReactNode;
	className?: string;
}

export const AccordionContent = ({ children, className }: AccordionContentProps) => (
	<div className={cn("px-2 py-3 sm:px-4", className)}>{children}</div>
);
