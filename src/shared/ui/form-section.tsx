interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export function FormSection({ title, children }: FormSectionProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-base font-semibold text-gray-700 border-b border-gray-100 pb-2">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
