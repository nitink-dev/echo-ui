
import React, { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
// If you use shadcn/ui, keep this import. Otherwise, see the native <input> version below.
import { Input } from "@/components/ui/input"; // Adjust to your project path

export type Slide = { slideBarcode: string };

export type BarcodeSearchProps = {
  /** Provide your list; defaults to the static array below if omitted */
  slides?: Slide[];
  /** Called when the user clicks “Select” on a result */
  onSelect?: (barcode: string) => void;
  /** Optional container className to style the component */
  className?: string;
  /** Placeholder text for the input */
  placeholder?: string;
};

/** Default static data (can be overridden through props.slides) */
const DEFAULT_SLIDES: Slide[] = [
  { slideBarcode: "395FQ7" },
  { slideBarcode: "395FQ8" },
  { slideBarcode: "395FQ9" },
  { slideBarcode: "395FQ10" },
  { slideBarcode: "395FQ11" },
  { slideBarcode: "395FQ12" },
  { slideBarcode: "395FQ13" },
  { slideBarcode: "395FQ14" },
  { slideBarcode: "395FQ15" },
  { slideBarcode: "395FQ16" },
  { slideBarcode: "395FQ17" },
  { slideBarcode: "395FQ18" },
  { slideBarcode: "395FQ19" },
  { slideBarcode: "395FQ20" },
  { slideBarcode: "395FQ21" },
  { slideBarcode: "395FQ22" },
  { slideBarcode: "395FQ23" },
  { slideBarcode: "395FQ24" },
  { slideBarcode: "395FQ25" },
  { slideBarcode: "395FQ26" },
  { slideBarcode: "395FQ27" },
  { slideBarcode: "395FQ28" },
  { slideBarcode: "395FQ29" },
  { slideBarcode: "395FQ30" },
  { slideBarcode: "395FQ31" },
  { slideBarcode: "395FQ32" },
  { slideBarcode: "395FQ33" },
  { slideBarcode: "395FQ34" },
  { slideBarcode: "395FQ341" },
];

const BarcodeSearch: React.FC<BarcodeSearchProps> = ({
  slides = DEFAULT_SLIDES,
  onSelect,
  className,
  placeholder = "Barcode",
}) => {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(""); // stores last Enter submit

  // Case-insensitive includes; when submitted, prioritize exact matches by sorting to top
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const partial = slides.filter((s) =>
      s.slideBarcode.toLowerCase().includes(q)
    );

    if (submitted) {
      const exact = (code: string) => (code.toLowerCase() === q ? 1 : 0);
      return [...partial].sort(
        (a, b) => exact(b.slideBarcode) - exact(a.slideBarcode)
      );
    }

    return partial;
  }, [query, submitted, slides]);

  const onSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitted(query.trim());
  };

  const onClear = () => {
    setQuery("");
    setSubmitted("");
  };

  const handleSelect = (barcode: string) => {
    if (onSelect) onSelect(barcode);
    else alert(`Selected: ${barcode}`);
  };

  return (
    <div className={`w-full max-w-lg space-y-3 ${className ?? ""}`}>
      {/* Search bar */}
      <form onSubmit={onSubmit}>
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-10 bg-white border-gray-200 focus:border-[#007BFF] focus:ring-[#007BFF]/20"
          />
          {query && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Search status */}
      <div className="text-sm text-gray-600">
        {query
          ? submitted
            ? `Showing results for "${submitted}"`
            : `Searching for "${query}"`
          : "Type a barcode to search…"}
      </div>

      {/* Results */}
      <div className="rounded-md border border-gray-200">
        {query && results.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No matches found.</div>
        ) : (
          <ul className="max-h-60 overflow-auto divide-y divide-gray-100">
            {results.map((item) => (
              <li
                key={item.slideBarcode}
                className="p-3 flex items-center justify-between"
              >
                <span className="font-mono text-sm">{item.slideBarcode}</span>
                <button
                  type="button"
                  className="text-[#007BFF] hover:underline text-sm"
                  onClick={() => handleSelect(item.slideBarcode)}
                >
                  Select
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BarcodeSearchProps;
