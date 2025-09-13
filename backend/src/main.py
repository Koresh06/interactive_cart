import asyncio
import logging

from aiogram_dialog import setup_dialogs
from aiohttp.web import Application, run_app
from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.types import BotCommand, BotCommandScopeDefault
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application

from src.logging import setup_logging
from src.config import settings
from src.router import router



logger = logging.getLogger(__name__)


WEBHOOK_PATH = f"/{settings.bot.token}"


async def set_commands(bot: Bot):
    commands = [
        BotCommand(command="/start", description="Старт"),
    ]
    await bot.set_my_commands(commands, BotCommandScopeDefault())


async def on_startup(app: Application):
    bot: Bot = app["bot"]

    await set_commands(bot)
    await bot.set_webhook(f"{settings.bot.base_url}/{settings.bot.token}")


async def on_shutdown(app: Application):
    bot: Bot = app["bot"]

    await bot.delete_webhook(drop_pending_updates=True)
    await bot.session.close()


def create_bot() -> Bot:
    return Bot(
        token=settings.bot.token,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )


async def async_main() -> Application:
    bot = create_bot()
    dp = Dispatcher()

    dp.include_router(router)

    setup_dialogs(dp)

    app = Application()
    
    app["bot"] = bot


    dp.startup.register(on_startup)
    dp.shutdown.register(on_shutdown)


    logger.info("Бот запущен!!!")

    SimpleRequestHandler(dispatcher=dp, bot=bot).register(app, path=WEBHOOK_PATH)
    setup_application(app, dp, bot=bot)

    return app


def main():
    app = asyncio.run(async_main())
    run_app(app, host="0.0.0.0", port=8085)


if __name__ == "__main__":
    logger = logging.getLogger(__name__)
    setup_logging()

    try:
        main()
    except (KeyboardInterrupt, SystemExit):
        logger.error("Bot has been stopped")