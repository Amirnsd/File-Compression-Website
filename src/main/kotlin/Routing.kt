package com.example

import io.ktor.server.application.*
import io.ktor.server.routing.*
import routes.compressionRoutes
import routes.staticRoutes

fun Application.configureRouting() {
    routing {
        staticRoutes()
        compressionRoutes()
    }
}
