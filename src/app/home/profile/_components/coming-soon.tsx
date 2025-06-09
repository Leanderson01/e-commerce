interface ComingSoonProps {
  title: string;
}

export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="py-12 text-center">
      <h2 className="mb-4 text-2xl font-medium">{title}</h2>
      <p className="text-gray-600">This section is coming soon.</p>
    </div>
  );
}
