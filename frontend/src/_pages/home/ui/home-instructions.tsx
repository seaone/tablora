import Image from "next/image";
import { Card, CardContent } from "@/shared/ui";
import step1Image from "../assets/instruction-step-1.png";
import step2Image from "../assets/instruction-step-2.png";
import step3Image from "../assets/instruction-step-3.png";
import step4Image from "../assets/instruction-step-4.png";

const STEPS = [
  {
    title: "Создай таблицу",
    image: step1Image,
    items: [
      "Войди в аккаунт и нажми «Создать таблицу».",
      "Введи название турнира и, если нужно, описание.",
      "Добавь столбцы и выбери тип для каждого: Число, Время или Текст.",
      "Добавь участников или команды и нажми «Опубликовать».",
    ],
    note: "Минимум — один столбец и один участник. Остальное можно добавить позже, прямо во время турнира.",
  },
  {
    title: "Поделись QR-кодом",
    image: step2Image,
    items: [
      "После публикации откроется страница с двумя карточками: «Для судей» и «Для зрителей».",
      "Покажи QR-код судьям или отправь ссылку в чат.",
      "Владелец может добавить судей по email, привязанному к их аккаунту, в блоке «Судьи» — только они и вы сможете вносить результаты.",
    ],
    note: "Ссылка для зрителей открывается без входа в аккаунт: регистрироваться не нужно.",
  },
  {
    title: "Введи результаты",
    image: step3Image,
    items: [
      "Судья открывает свою ссылку, входит в аккаунт и видит список участников.",
      "Нажимает на карандаш у участника и заполняет поля по столбцам.",
      "Работать можно с любого устройства: с ноутбука, планшета или телефона.",
      "Для числовых столбцов есть кнопки −1 / +1 / +2 / +3 — очки набираются касаниями.",
      "Время вводится в формате мм:сс или мм:сс.мс, в текстовый столбец можно записать заметку.",
      "Нажми «Сохранить» — результат сразу появится в таблице у зрителей.",
    ],
    note: "Несколько судей могут работать одновременно.",
  },
  {
    title: "Покажи результаты зрителям",
    image: step4Image,
    items: [
      "Открой ссылку для зрителей на экране или проекторе — таблица обновляется сама, обновлять страницу не нужно.",
      "Введённый судьёй результат появляется в таблице у зрителей сразу после сохранения.",
    ],
    note: null,
  },
];

interface Props {
  className?: string;
}

function HomeInstructions({ className }: Props) {
  return (
    <section aria-labelledby="instruction-title" className={className}>
      <h2
        id="instruction-title"
        className="font-heading text-2xl sm:text-3xl font-bold text-foreground"
      >
        Как пользоваться сервисом
      </h2>
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-4">
        Организатору и судьям нужно любое устройство с браузером. Вход — через аккаунт одного из
        сервисов авторизации. Зрителям вход не нужен вовсе.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        {STEPS.map((step) => (
          <Card key={step.title} size="sm" className="h-full">
            <Image
              src={step.image}
              alt=""
              sizes="(min-width: 768px) 50vw, 100vw"
              className="h-auto w-full"
            />
            <CardContent>
              <h3 className="font-heading text-base sm:text-lg font-bold text-foreground">
                {step.title}
              </h3>

              <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground marker:text-primary">
                {step.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              {step.note && (
                <p className="rounded-lg bg-muted px-3 py-2 text-xs text-foreground mt-4">
                  {step.note}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export { HomeInstructions };
