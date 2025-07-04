import axios from "axios"
import { AuthorizeError } from "../error"
import { config } from "../../config"
import { logger } from "../logger"

export const ValidateUser = async (token: string) => {
  try {
    logger.debug("Validating user token")
    const response = await axios.get(`${config.services.auth}/auth/validate`, {
      headers: {
        Authorization: token,
      },
    })
    if (response.status !== 200) {
      throw new AuthorizeError("User not authorized")
    }
    return response.data
  } catch (error) {
    logger.error(`Authentication error: ${error}`)
    throw new AuthorizeError("User not authorized")
  }
}

