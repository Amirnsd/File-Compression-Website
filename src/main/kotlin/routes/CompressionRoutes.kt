package routes

import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import services.CompressionService
import java.util.zip.Deflater

fun Route.compressionRoutes() {
    val compressionService = CompressionService()
    
    post("/compress") {
        try {
            val multipart = call.receiveMultipart()
            val files = mutableListOf<CompressionService.FileInfo>()
            var compressionType = "gzip"
            var compressionLevel = "normal"
            var passwordValue: String? = null
            
            multipart.forEachPart { part ->
                when (part) {
                    is PartData.FileItem -> {
                        val fileName = part.originalFileName ?: "file"
                        val fileBytes = part.streamProvider().readBytes()
                        files.add(CompressionService.FileInfo(fileName, fileBytes.size.toLong(), fileBytes))
                    }
                    is PartData.FormItem -> {
                        when (part.name) {
                            "type" -> compressionType = part.value
                            "level" -> compressionLevel = part.value
                            "password" -> passwordValue = part.value.takeIf { it.isNotBlank() }
                        }
                    }
                    else -> {}
                }
                part.dispose()
            }
            
            if (files.isEmpty()) {
                call.respond(HttpStatusCode.BadRequest, "No files provided")
                return@post
            }
            
            val level = when (compressionLevel.lowercase()) {
                "fast" -> Deflater.BEST_SPEED
                "maximum" -> Deflater.BEST_COMPRESSION
                else -> Deflater.DEFAULT_COMPRESSION
            }
            
            val originalSize = files.sumOf { it.size }
            val compressedBytes: ByteArray
            val outputFileName: String
            
            if (files.size == 1) {
                val file = files.first()
                compressedBytes = when (compressionType.lowercase()) {
                    "zip" -> {
                        val pwd = passwordValue
                        if (pwd != null) {
                            compressionService.compressZipWithPassword(file.data, file.name, pwd, level)
                        } else {
                            compressionService.compressZip(file.data, file.name, level)
                        }
                    }
                    "deflate" -> compressionService.compressDeflate(file.data, file.name, level)
                    "tar.gz", "targz" -> compressionService.compressTarGz(file.data, file.name, level)
                    else -> compressionService.compressGzip(file.data, file.name, level)
                }
                
                outputFileName = when (compressionType.lowercase()) {
                    "zip" -> "${file.name}.zip"
                    "deflate" -> "${file.name}.deflate"
                    "tar.gz", "targz" -> "${file.name}.tar.gz"
                    else -> "${file.name}.gz"
                }
            } else {
                compressedBytes = when (compressionType.lowercase()) {
                    "tar.gz", "targz" -> compressionService.compressMultipleFilesTarGz(files, level)
                    else -> {
                        val pwd = passwordValue
                        if (pwd != null) {
                            compressionService.compressMultipleFilesZipWithPassword(files, pwd, level)
                        } else {
                            compressionService.compressMultipleFilesZip(files, level)
                        }
                    }
                }
                
                outputFileName = when (compressionType.lowercase()) {
                    "tar.gz", "targz" -> "compressed_files.tar.gz"
                    else -> "compressed_files.zip"
                }
            }
            
            val stats = compressionService.getCompressionStats(originalSize, compressedBytes.size.toLong())
            
            call.response.header(
                HttpHeaders.ContentDisposition,
                ContentDisposition.Attachment.withParameter(
                    ContentDisposition.Parameters.FileName,
                    outputFileName
                ).toString()
            )
            call.response.header("X-Original-Size", stats.originalSize.toString())
            call.response.header("X-Compressed-Size", stats.compressedSize.toString())
            call.response.header("X-Compression-Ratio", String.format("%.2f", stats.compressionRatio))
            call.response.header("X-File-Count", files.size.toString())
            
            call.respondBytes(compressedBytes, ContentType.Application.OctetStream)
            
        } catch (e: Exception) {
            call.respond(HttpStatusCode.InternalServerError, "Compression failed: ${e.message}")
        }
    }
    
    post("/decompress") {
        try {
            val multipart = call.receiveMultipart()
            var fileName = "file"
            var fileBytes: ByteArray? = null
            var passwordValue: String? = null
            
            multipart.forEachPart { part ->
                when (part) {
                    is PartData.FileItem -> {
                        fileName = part.originalFileName ?: "file"
                        fileBytes = part.streamProvider().readBytes()
                    }
                    is PartData.FormItem -> {
                        if (part.name == "password") {
                            passwordValue = part.value.takeIf { it.isNotBlank() }
                        }
                    }
                    else -> {}
                }
                part.dispose()
            }
            
            if (fileBytes == null) {
                call.respond(HttpStatusCode.BadRequest, "No file provided")
                return@post
            }
            
            val decompressedBytes: ByteArray
            val outputFileName: String
            
            when {
                fileName.endsWith(".gz", ignoreCase = true) && !fileName.endsWith(".tar.gz", ignoreCase = true) -> {
                    decompressedBytes = compressionService.decompressGzip(fileBytes!!)
                    outputFileName = fileName.removeSuffix(".gz").removeSuffix(".GZ")
                }
                fileName.endsWith(".zip", ignoreCase = true) -> {
                    val pwd = passwordValue
                    if (pwd != null) {
                        val filesMap = compressionService.decompressZipWithPassword(fileBytes!!, pwd)
                        val firstEntry = filesMap.entries.first()
                        decompressedBytes = firstEntry.value
                        outputFileName = firstEntry.key
                    } else {
                        val (originalName, bytes) = compressionService.decompressZip(fileBytes!!)
                        decompressedBytes = bytes
                        outputFileName = originalName
                    }
                }
                fileName.endsWith(".deflate", ignoreCase = true) -> {
                    decompressedBytes = compressionService.decompressDeflate(fileBytes!!)
                    outputFileName = fileName.removeSuffix(".deflate").removeSuffix(".DEFLATE")
                }
                fileName.endsWith(".tar.gz", ignoreCase = true) || fileName.endsWith(".tgz", ignoreCase = true) -> {
                    val (originalName, bytes) = compressionService.decompressTarGz(fileBytes!!)
                    decompressedBytes = bytes
                    outputFileName = originalName
                }
                fileName.endsWith(".rar", ignoreCase = true) -> {
                    val (originalName, bytes) = compressionService.decompressRar(fileBytes!!)
                    decompressedBytes = bytes
                    outputFileName = originalName
                }
                else -> {
                    call.respond(HttpStatusCode.BadRequest, "Unsupported file format. Supported: .gz, .zip, .deflate, .tar.gz, .rar")
                    return@post
                }
            }
            
            call.response.header(
                HttpHeaders.ContentDisposition,
                ContentDisposition.Attachment.withParameter(
                    ContentDisposition.Parameters.FileName,
                    outputFileName
                ).toString()
            )
            
            call.respondBytes(decompressedBytes, ContentType.Application.OctetStream)
            
        } catch (e: Exception) {
            call.respond(HttpStatusCode.InternalServerError, "Decompression failed: ${e.message}")
        }
    }
}