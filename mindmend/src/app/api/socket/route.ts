export async function GET() {
    // This endpoint can be used for health checks
    return Response.json({
        status: "Socket.IO server running",
        timestamp: new Date().toISOString(),
    })
}