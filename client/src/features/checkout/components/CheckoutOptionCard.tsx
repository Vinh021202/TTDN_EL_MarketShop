import type { ChangeEvent, ReactNode } from 'react';

interface CheckoutOptionCardProps {
    active: boolean;
    disabled?: boolean;
    name: string;
    value: string;
    checked: boolean;
    title: string;
    description: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    badge?: ReactNode;
}

export function CheckoutOptionCard({
    active,
    disabled = false,
    name,
    value,
    checked,
    title,
    description,
    onChange,
    badge,
}: CheckoutOptionCardProps) {
    return (
        <label
            className={`ttdn-option-card${active ? ' is-active' : ''}${
                disabled ? ' is-disabled' : ''
            }`}
        >
            <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
            />
            <div className="flex-grow-1">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                    <h5 className="mb-0">{title}</h5>
                    {badge}
                </div>
                <p>{description}</p>
            </div>
        </label>
    );
}
