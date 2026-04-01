import { apiError, HTTP } from "@/lib/api-response";

export async function POST(req: Request) {
    try {
        const { name, email, message, subject } = await req.json();

        if (!name || !email || !message) {
            return apiError("Missing required fields", HTTP.BAD_REQUEST);
        }

        return apiError(
            "Contact form delivery is not configured yet. Please use support tickets until email delivery is set up.",
            HTTP.NOT_IMPLEMENTED
        );
    } catch (error) {
        console.error("Contact API Error:", error);
        return apiError("Failed to process message. Please try again later.", HTTP.INTERNAL_SERVER_ERROR);
    }
}
