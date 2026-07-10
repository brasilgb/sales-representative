import type { StylesConfig } from 'react-select';

export const reactSelectThemeStyles: StylesConfig<any, false> = {
    control: (base, state) => ({
        ...base,
        minHeight: '36px',
        borderColor: state.isFocused ? 'var(--ring)' : 'var(--input)',
        backgroundColor: 'var(--background)',
        boxShadow: state.isFocused ? '0 0 0 1px var(--ring)' : 'none',
        color: 'var(--foreground)',
        ':hover': {
            borderColor: state.isFocused ? 'var(--ring)' : 'var(--input)',
        },
    }),
    singleValue: (base) => ({ ...base, color: 'var(--foreground)' }),
    input: (base) => ({ ...base, color: 'var(--foreground)' }),
    placeholder: (base) => ({ ...base, color: 'var(--muted-foreground)' }),
    dropdownIndicator: (base) => ({ ...base, color: 'var(--muted-foreground)' }),
    indicatorSeparator: (base) => ({ ...base, backgroundColor: 'var(--border)' }),
    menu: (base) => ({
        ...base,
        zIndex: 50,
        border: '1px solid var(--border)',
        backgroundColor: 'var(--popover)',
        color: 'var(--popover-foreground)',
    }),
    menuList: (base) => ({ ...base, fontSize: '14px', backgroundColor: 'var(--popover)' }),
    option: (base, state) => ({
        ...base,
        cursor: 'pointer',
        backgroundColor: state.isSelected ? 'var(--primary)' : state.isFocused ? 'var(--accent)' : 'var(--popover)',
        color: state.isSelected ? 'var(--primary-foreground)' : state.isFocused ? 'var(--accent-foreground)' : 'var(--popover-foreground)',
        ':active': {
            backgroundColor: state.isSelected ? 'var(--primary)' : 'var(--accent)',
        },
    }),
    noOptionsMessage: (base) => ({ ...base, color: 'var(--muted-foreground)' }),
};
