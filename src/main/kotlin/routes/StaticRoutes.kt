package routes

import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.io.File

fun Route.staticRoutes() {
    staticResources("/static", "static")
    
    get("/") {
        call.respondRedirect("/static/index.html")
    }
}