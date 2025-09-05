export function TrustedBySection() {
  const companies = [
    { name: "Upwork", className: "text-gray-400 font-medium" },
    { name: "HELLOSIGN", className: "text-gray-400 font-semibold" },
    { name: "zendesk", className: "text-gray-400 font-medium" },
    { name: "Lattice", className: "text-gray-400 font-medium" },
    { name: "getaround", className: "text-gray-400 font-medium" }
  ]

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60">
          {companies.map((company, index) => (
            <div key={index} className={`text-xl md:text-2xl ${company.className} hover:text-gray-600 transition-colors`}>
              {company.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}