import logging
from aiogram import Router
from aiogram.types import Message, InlineKeyboardButton, WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.filters import CommandStart


from src.config import settings


logger = logging.getLogger(__name__)


router = Router()


async def get_webapp_keyboard():
    builder = InlineKeyboardBuilder()

    builder.add(
        InlineKeyboardButton(
            text="Открыть",
            web_app=WebAppInfo(url=settings.bot.web_app),
        )
    )


    return builder.adjust(1).as_markup()


@router.message(CommandStart())
async def process_start(message: Message):
    await message.answer(
        "Нажми кнопку, чтобы открыть приложение 👇",
        reply_markup=await get_webapp_keyboard(),
    )
