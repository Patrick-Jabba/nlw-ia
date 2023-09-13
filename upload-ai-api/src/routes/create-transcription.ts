import { z } from "zod";
import { prisma } from "../lib/prisma";
import { openai } from './../lib/openai';
import { FastifyInstance } from "fastify";
import { createReadStream } from "node:fs"


export async function createTranscriptionRoute(app: FastifyInstance) {
  app.post('/videos/:videoId/transcription', async (request) => {
    const paramSchema = z.object({
      videoId: z.string().uuid(),
    })

    const { videoId } = paramSchema.parse(request.params)

    const bodySchema = z.object({
      prompt: z.string(),
    })

    const { prompt } = bodySchema.parse(request.body)

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      }
    })

    const videoPath = video.path

    const audioReadStream = createReadStream(videoPath)

    const response = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: 'whisper-1',
      language: 'pt',
      response_format: 'json',
      temperature: 0,
      prompt,
    })

    return response.text
  })
}