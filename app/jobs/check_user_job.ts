import User from '#models/user'
import { Job } from '@adonisjs/queue'
import type { JobOptions } from '@adonisjs/queue/types'

interface CheckUserJobPayload {
  // Define your payload type here
}

export default class CheckUserJob extends Job<CheckUserJobPayload> {
  static options: JobOptions = {
    queue: 'default',
    maxRetries: 3,
  }

  async execute() {
    await User.query().first()
  }

  async failed(error: Error) {
    console.error('CheckUserJob failed:', error.message)
  }
}
