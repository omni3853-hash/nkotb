interface BreadcrumbProps {
    imageUrl: string;
    title: string;
}

export function Breadcrumb({ imageUrl, title }: BreadcrumbProps) {
    return (
        <section
            className="h-[40vh] overflow-hidden flex items-end p-5"
            style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight">
                {title}
            </h1>
        </section>
    );
}
