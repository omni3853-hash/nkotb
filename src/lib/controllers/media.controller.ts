import { NextRequest, NextResponse } from "next/server";
import { MediaService } from "@/lib/services/media.service";
import MediaServiceImpl from "@/lib/services/impl/media.service.impl";
import { MediaQueryDto, CreateMediaDto, UpdateMediaDto, MediaCategory } from "@/lib/dto/media.dto";
import { validator } from "@/lib/utils/validator.utils";

const service: MediaService = new MediaServiceImpl();

export async function createMediaController(req: NextRequest) {
    try {
        const body = await req.json();
        const dto = new CreateMediaDto(body);

        const errors = validator(CreateMediaDto, dto);
        if (errors) {
            return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        }

        const media = await service.create(dto);
        return NextResponse.json({ message: "Media created", media }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

export async function listMediaController(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const dto = new MediaQueryDto({
            search: searchParams.get("search") || undefined,
            category: searchParams.get("category") as MediaCategory || undefined,
            page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
            limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
        });

        const errors = validator(MediaQueryDto, dto);
        if (errors) {
            return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        }

        const data = await service.list(dto);
        return NextResponse.json({ message: "Media retrieved", ...data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

export async function getMediaByIdController(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolved = await params;
        const media = await service.getById(resolved.id);
        return NextResponse.json({ message: "Media retrieved", media }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

export async function updateMediaController(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const body = await req.json();
        const dto = new UpdateMediaDto(body);

        const errors = validator(UpdateMediaDto, dto);
        if (errors) {
            return NextResponse.json({ message: "Validation Error", errors: errors.details }, { status: 400 });
        }

        const resolved = await params;
        const media = await service.update(resolved.id, dto);
        return NextResponse.json({ message: "Media updated", media }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}

export async function deleteMediaController(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolved = await params;
        await service.delete(resolved.id);
        return NextResponse.json({ message: "Media deleted" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Internal server error" }, { status: error.statusCode || 500 });
    }
}
