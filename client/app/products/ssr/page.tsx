// Explicitly setting this to false to avoid static generation errors
export const dynamic = 'force-dynamic';

export default function ProductSSRPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Products (Server-Side Rendered)</h1>
      <p>This page is loaded during runtime and not during build.</p>
    </div>
  );
}
