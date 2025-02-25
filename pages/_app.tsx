import { useEffect } from "react";
import "@mantine/core/styles.css";
import '../styles/globals.css';
import Head from "next/head";
import { MantineProvider } from "@mantine/core";
import { theme } from "../theme";

export default function App({ Component, pageProps }: any) {

    useEffect(() => {
        // Определение языка пользователя
        const userLang = navigator.language;
        let description = "Get schedule to KMITL Trains and watch delays and trains in live view.";

        if (userLang.startsWith("th")) {
            description = "ดูตารางเวลารถไฟไป KMITL และติดตามความล่าช้าและขบวนรถไฟแบบเรียลไทม์";
        } else if (userLang.startsWith("zh")) {
            description = "获取前往 KMITL 火车的时刻表，并实时查看列车延误和运行情况。";
        } else if (userLang.startsWith("ru")) {
            description = "Получите расписание поездов до KMITL и следите за задержками в режиме реального времени.";
        }

        // Обновление meta description
        const metaTag = document.querySelector("meta[name='description']");
        if (metaTag) {
            metaTag.setAttribute("content", description);
        } else {
            const newMetaTag = document.createElement("meta");
            newMetaTag.name = "description";
            newMetaTag.content = description;
            document.head.appendChild(newMetaTag);
        }
    }, []);

    return (
        <MantineProvider theme={theme}>
            <Head>
                <title>KMITL-TRAIN</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no" />

                {/* Описание по умолчанию (меняется через useEffect) */}
                <meta name="description" content="Get schedule to KMITL Trains and watch delays and trains in live view." />

                {/* Ключевые слова для SEO и поиска на разных языках */}
                <meta name="keywords" content="
            KMITL train, train to KMITL, how to get to KMITL by train, Ladkrabang station, SRT KMITL, KMITL railway,
            火车到KMITL, 如何乘火车到KMITL, KMITL火车时刻表, KMITL火车, KMITL火车站,
            รถไฟไปKMITL, ตารางเวลารถไฟ KMITL, วิธีเดินทางไป KMITL โดยรถไฟ, สถานีลาดกระบัง KMITL,
            Поезд до KMITL, как добраться до KMITL на поезде, расписание поездов KMITL, станция Ладкрабанг KMITL
          " />

                <meta name="author" content="KMITL Transport Guide" />

                {/* <link rel="shortcut icon" href="/favicon.ico" /> */}

                {/* Open Graph (Facebook & LinkedIn) */}
                <meta property="og:title" content="Train to KMITL – Routes & Schedules" />
                <meta property="og:description" content="Find the best train routes to King Mongkut's Institute of Technology Ladkrabang (KMITL). Live schedules, routes & station details." />
                {/* <meta property="og:image" content="https://yourwebsite.com/kmitl-train-thumbnail.jpg" /> */}
                <meta property="og:url" content="https://yourwebsite.com/kmitl-train" />
                <meta property="og:type" content="website" />

                {/* Twitter Meta Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Train to KMITL – Find the Best Route" />
                <meta name="twitter:description" content="Get real-time train schedules and directions to KMITL. Find out the best way to reach King Mongkut's Institute of Technology Ladkrabang by train." />
                {/* <meta name="twitter:image" content="https://kmitlbkk.vercel.app/kmitl-train-thumbnail.jpg" /> */}
                <meta name="twitter:site" content="@YourTwitterHandle" />
                <meta name="twitter:creator" content="@YourTwitterHandle" />
            </Head>
            <Component {...pageProps} />
        </MantineProvider>
    );
}
