import { getChatManager } from "@/lib/socket-manager"

export async function GET() {
    try {
        const manager = getChatManager()
        const stats = manager.getRoomStats()

        return Response.json({
            success: true,
            data: stats,
        })
    } catch (error) {
        console.error("Error fetching room stats:", error)
        return Response.json({ success: false, error: "Failed to fetch room statistics" }, { status: 500 })
    }
}