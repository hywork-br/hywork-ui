import { FormMessageContext } from "../form-message";
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { Controller, ControllerProps, FieldPath, FieldValues, FormProvider, useFormContext } from "react-hook-form";

import { cn } from "../../lib/cn";
import { Label } from "../label";

const Form = FormProvider;

type FormFieldContextValue<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext.name) {
    throw new Error("useFormField precisa estar dentro de <FormField>");
  }

  const fieldState = getFieldState(fieldContext.name, formState);

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const id = React.useId();
  // Fora de um FormField (FormItem usado só como grupo) não há erro a mostrar.
  const campo = React.useContext(FormFieldContext);
  const form = useFormContext();
  const erro = campo.name && form ? form.getFieldState(campo.name, form.formState).error : undefined;
  const mensagem = React.useMemo(
    () => ({ id: `${id}-form-item-message`, error: erro ? String(erro.message) : undefined }),
    [id, erro],
  );

  return (
    <FormItemContext.Provider value={{ id }}>
     <FormMessageContext.Provider value={mensagem}>
      {/* 6px entre rótulo, campo e mensagem — o respiro da amostra eleita pela
          PO (Rótulo · Opção B, Erro · Opção B). Com 2px o rótulo colava no campo. */}
      <div ref={ref} className={cn("space-y-1.5", className)} {...props} />
     </FormMessageContext.Provider>
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    required?: boolean;
  }
>(({ className, required, children, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label ref={ref} className={cn(error && "text-hw-error-text", className)} htmlFor={formItemId} {...props}>
      {children}
      {required && <span className="ml-0.5 text-hw-error-text">*</span>}
    </Label>
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return <p ref={ref} id={formDescriptionId} className={cn("text-sm text-muted-foreground", className)} {...props} />;
});
FormDescription.displayName = "FormDescription";

// A mensagem de erro é o `FormMessage` de `core/form-message`: dentro de um
// `FormItem` ele lê o erro do campo pelo contexto acima; solto, mostra o texto
// que a tela passar. Um componente só, nos dois usos.

export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormField };

