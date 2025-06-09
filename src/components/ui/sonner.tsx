// sonner.tsx
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import React from "react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

// This string contains the custom CSS for the close button.
// Placing it here keeps the styles co-located with the component.
const customCloseButtonStyles = `
  /*
    By adding the '.toaster' class to the Sonner component, we can create
    more specific and stable selectors for the close button without needing
    the overly-complex selectors that were in App.tsx.
  */
  .toaster [data-sonner-toast] [data-close-button] {
    position: absolute !important;
    top: 50% !important;
    right: 12px !important;
    left: auto !important;
    transform: translateY(-50%) !important;
    background: transparent !important;
    border: none !important;
    outline: none !important;
    padding: 4px !important;
    width: 20px !important;
    height: 20px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    border-radius: 4px !important;
    transition: background-color 0.2s ease !important;
  }

  /* A subtle hover effect for the close button */
  .toaster [data-sonner-toast] [data-close-button]:hover {
    background: rgba(255, 255, 255, 0.1) !important;
    color: inherit !important;
  }

  /* Use a ::before pseudo-element with an SVG mask to create the 'X' icon */
  .toaster [data-sonner-toast] [data-close-button]::before {
    content: '' !important;
    width: 16px !important;
    height: 16px !important;
    background-color: currentColor !important;
    -webkit-mask-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cline x1='18' y1='6' x2='6' y2='18'/%3e%3cline x1='6' y1='6' x2='18' y2='18'/%3e%3c/svg%3e") !important;
    mask-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cline x1='18' y1='6' x2='6' y2='18'/%3e%3cline x1='6' y1='6' x2='18' y2='18'/%3e%3c/svg%3e") !important;
    -webkit-mask-size: contain !important;
    mask-size: contain !important;
    -webkit-mask-repeat: no-repeat !important;
    mask-repeat: no-repeat !important;
    -webkit-mask-position: center !important;
    mask-position: center !important;
  }

  /* Hide any default content inside the button (like the original 'x') */
  .toaster [data-sonner-toast] [data-close-button] > * {
    display: none !important;
  }
`;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <>
      <style>{customCloseButtonStyles}</style>
      <Sonner
        theme={theme as ToasterProps["theme"]}
        className="toaster group"
        toastOptions={{
          classNames: {
            toast:
              "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
            description: "group-[.toast]:text-muted-foreground",
            actionButton:
              "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            cancelButton:
              "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          },
        }}
        {...props}
      />
    </>
  );
};

export { Toaster, toast };
