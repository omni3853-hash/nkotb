import { NextRequest, NextResponse } from "next/server";
import { AuthRequest } from "@/lib/middleware/isLoggedIn.middleware";
import { validator } from "@/lib/utils/validator.utils";
import { BlogPostService } from "@/lib/services/blog.service";
import BlogPostServiceImpl from "@/lib/services/impl/blog.service.impl";
import { BlogPostQueryDto, CreateBlogPostDto, UpdateBlogPostDto } from "@/lib/dto/blog.dto";
import { CustomError } from "@/lib/utils/customError.utils";

const service: BlogPostService = new BlogPostServiceImpl();

/* Admin create */
export async function createBlogPostController(req: AuthRequest) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new CreateBlogPostDto(body);

        const errors = validator(CreateBlogPostDto, dto);
        if (errors) {
            return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        }

        const post = await service.create(adminId, dto);
        return NextResponse.json({ message: "Post created", post }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* Public and admin list */
export async function listBlogPostsController(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const dto = new BlogPostQueryDto({
            search: searchParams.get("search") || undefined,
            category: searchParams.get("category") || undefined,
            tag: searchParams.get("tag") || undefined,
            celebrityId: searchParams.get("celebrityId") || undefined,
            eventId: searchParams.get("eventId") || undefined,
            status: (searchParams.get("status") as any) || undefined,
            onlyActive: searchParams.get("onlyActive") !== "false",
            onlyPublished: searchParams.get("onlyPublished") === "true",
            page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
            limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
        });

        const errors = validator(BlogPostQueryDto, dto);
        if (errors) {
            return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        }

        const data = await service.list(dto);
        return NextResponse.json({ message: "Posts retrieved", ...data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* Get by id */
export async function getBlogPostByIdController(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolved = await params;
        const post = await service.getById(resolved.id);
        return NextResponse.json({ message: "Post retrieved", post }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* Get by slug */
export async function getBlogPostBySlugController(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const resolved = await params;
        const post = await service.getBySlug(resolved.slug);
        return NextResponse.json({ message: "Post retrieved", post }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* Admin update */
export async function updateBlogPostController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const body = await req.json();
        const dto = new UpdateBlogPostDto(body);
        const errors = validator(UpdateBlogPostDto, dto);
        if (errors) {
            return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        }

        const resolved = await params;
        const post = await service.update(adminId, resolved.id, dto);
        return NextResponse.json({ message: "Post updated", post }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* Admin delete */
export async function deleteBlogPostController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");
        const resolved = await params;

        await service.delete(adminId, resolved.id);
        return NextResponse.json({ message: "Post deleted" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

/* Admin toggle active (optional, same pattern as others) */
export async function toggleBlogPostActiveController(req: AuthRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const adminId = req.user?.sub;
        if (!adminId) throw new CustomError(401, "Unauthorized");

        const { isActive } = await req.json();
        const resolved = await params;
        const post = await service.toggleActive(adminId, resolved.id, Boolean(isActive));
        return NextResponse.json({ message: "Post status updated", post }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}
