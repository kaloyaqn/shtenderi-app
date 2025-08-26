"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useApi } from "@/hooks/useApi";

/**
 * Base form component with common functionality
 */
export default function BaseForm({
  schema,
  fields = [],
  onSubmit,
  defaultValues = {},
  submitText = "Submit",
  cancelText = "Cancel",
  onCancel,
  className = "",
  endpoint,
  successMessage,
  errorMessage,
  onSuccess,
  onError,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
  });

  const api = useApi();

  const handleFormSubmit = async (data) => {
    if (onSubmit) {
      await onSubmit(data);
      return;
    }

    if (endpoint) {
      const result = await api.execute(
        () => fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }),
        {
          successMessage: successMessage || "Saved successfully",
          errorMessage: errorMessage || "Failed to save",
          onSuccess: (responseData) => {
            reset();
            onSuccess?.(responseData);
          },
          onError,
        }
      );
    }
  };

  const renderField = (field) => {
    const { name, label, type = "text", placeholder, required, options = [], ...fieldProps } = field;

    const commonProps = {
      id: name,
      placeholder,
      ...register(name),
      ...fieldProps,
    };

    switch (type) {
      case "textarea":
        return (
          <div key={name} className="grid gap-2">
            <Label htmlFor={name}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea {...commonProps} />
            {errors[name] && (
              <p className="text-red-500 text-sm">{errors[name]?.message}</p>
            )}
          </div>
        );

      case "select":
        return (
          <div key={name} className="grid gap-2">
            <Label htmlFor={name}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <Select onValueChange={(value) => setValue(name, value)} defaultValue={defaultValues[name]}>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors[name] && (
              <p className="text-red-500 text-sm">{errors[name]?.message}</p>
            )}
          </div>
        );

      case "switch":
        return (
          <div key={name} className="flex items-center space-x-2">
            <Switch
              id={name}
              checked={watch(name)}
              onCheckedChange={(checked) => setValue(name, checked)}
            />
            <Label htmlFor={name}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            {errors[name] && (
              <p className="text-red-500 text-sm">{errors[name]?.message}</p>
            )}
          </div>
        );

      default:
        return (
          <div key={name} className="grid gap-2">
            <Label htmlFor={name}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <Input type={type} {...commonProps} />
            {errors[name] && (
              <p className="text-red-500 text-sm">{errors[name]?.message}</p>
            )}
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={`space-y-6 ${className}`}>
      <div className="space-y-4">
        {fields.map(renderField)}
      </div>

      <div className="flex justify-end space-x-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || api.loading}>
          {isSubmitting || api.loading ? "Saving..." : submitText}
        </Button>
      </div>
    </form>
  );
}

