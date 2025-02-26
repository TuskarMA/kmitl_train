// Импорт компонентов из Mantine
import {
    AppShell,
    Text,
    Group,
    useComputedColorScheme,
    useMantineColorScheme, ActionIcon, Center, Tabs, Table, Badge, Loader,
    Select, Modal,
    Timeline, Paper,
    Menu, Flex
} from '@mantine/core';
import {useDisclosure} from "@mantine/hooks";

// Блок импорта переводов
import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";
import en from '../locales/en/translation.json';
import th from '../locales/th/translation.json';
import ru from '../locales/ru/translation.json';
import ch from '../locales/ch/translation.json';
i18n.use(initReactI18next)
    .init({
        resources: {
            en: {translation: en},
            th: {translation: th},
            ru: {translation: ru},
            ch: {translation: ch}
        },
        lng: "en",
        fallbackLng: "en",
        interpolation: {
            escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
        }
    }).then(() => {});

// Импорт иконок
import { FaPersonArrowUpFromLine, FaPersonArrowDownToLine } from "react-icons/fa6";
import { SiGooglemaps } from "react-icons/si";
import {IconSun, IconMoon, IconLanguage, IconBrandGithub} from '@tabler/icons-react';
import { LuTrainTrack } from "react-icons/lu";

// Импорт списка станций
import stationList from './api/stationList.json';

//Импорт стилей
import classes from './Index.module.css';

// Импорт остальных модулей
import cx from 'clsx';
import axios from 'axios';
import {useEffect, useRef, useState} from "react";

// Начало экспорта компонента
export default function MobileNavbar() {
    const { t } = useTranslation();

    const [opened, { open, close }] = useDisclosure(false);
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const [direction, setDirection] = useState('from');
    const [data, setData] = useState(null);
    const [fromTo42, setFromTo42] = useState(null);
    const [dataStation, setDataStation] = useState(null);
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

    const [clickedTrain, setClickedTrain] = useState(null);
    const [trainData, setTrainData] = useState(null);

    useEffect(() => {
        axios.get('/api/getStationTrainList?station=3107').then((response) => {
          setData(response.data)
        })
    }, [])

    const [activeIndex, setActiveIndex] = useState(-1);

    const languages = [
        { value: 'en', label: 'English' },
        { value: 'th', label: 'ไทย' },
        { value: 'ch', label: '中文' },
        { value: 'ru', label: 'Русский' },
    ];

    const handleLanguageChange = (value) => {
        setCurrentLanguage(value);
        i18n.changeLanguage(value).then(() => {}); // Изменение языка через i18n
    };

    const intervalRef = useRef(null);  // To store interval ID

    const handleRowClick = (trainObject) => {
        const trainId = trainObject.trainid;
        setClickedTrain(trainId);
        open();

        // Clear the existing interval if there is one
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        axios.get('/api/getTrainInfo?train=' + trainId).then((response) => {
            if(!response) return;
            if(!response?.data?.success) return;

            setTrainData(response.data.data);


            // if(!trainData) return;
            const index = response.data.data.right.findIndex((trainData) => trainData.current === 1);

            if (index !== -1 && index !== response.data.data.right.length - 1) {
                intervalRef.current = setInterval(() => {
                    setActiveIndex((prevIndex) => (prevIndex === index ? index + 1 : index));
                }, 600); // 0.6 секунды
            } else {
                setActiveIndex(index);
            }


        });
    };


    // Возвращаем Loader если загрузка не завершена
    if (!data) return (
        <Flex justify="center" align="center" style={{ height: '100vh' }}>
            <Loader size={'xl'} />
        </Flex>
    );

    return (
        <>
            <Modal opened={opened} onClose={close} title={`${t('trainInfo')} ${clickedTrain}`}>
                {parseInt(trainData?.trainid) !== parseInt(clickedTrain) ?
                    <Flex>
                        <Center>
                            <Loader size={'xl'} />
                        </Center>
                    </Flex>
                    :
                    <Timeline active={activeIndex} bulletSize={24} lineWidth={5}>
                        {trainData?.right?.map((trainObject, index) => (
                            <Timeline.Item key={index} title={
                                <span style={{ display: 'inline-flex', alignItems: 'center' }}>

                                {trainObject.sten === 'Pra Chom Klao' ? (
                                    <Paper radius={'md'} shadow={'xl'}>
                                        <Text size="xl" fw={1200} c="green">
                                            Pra Chom Klao (KMITL)
                                        </Text>
                                    </Paper>

                                ) : (
                                    trainObject.sten
                                )}

                                    {/* Ссылка на Google Maps, если она доступна */}
                                    {stationList[trainObject.stcode]?.gmaps && (
                                        <a href={stationList[trainObject.stcode].gmaps} target="_blank" rel="noopener noreferrer">
                                            <SiGooglemaps />
                                        </a>
                                    )}
                        </span>
                            }>
                                {/* Отображение времени прибытия */}
                                {
                                    (!trainObject?.actarr || trainObject.actarr === 'n/a') && trainObject?.arrive !== "0" ? ( // Hide if arrive === "0"
                                        trainObject?.arrive !== '-' && (
                                            <Text size="xs" c={(!trainObject?.actarr && !trainObject?.actdep) ? "default" : "green"}>
                                                {trainObject.passyet === '1' ? t('arrivedAt') : t('arrivesAt')} {trainObject?.arrive}
                                                {!trainObject?.actarr && !trainObject?.actdep && ' ' + t('nodata')}
                                            </Text>
                                        )
                                    ) : (
                                        trainObject?.actarr !== '-' && trainObject?.arrive !== "0" && ( // Hide if arrive === "0"
                                            <Text size="xs" c="#ff0000">
                                                {trainObject.passyet === '1' ? t('arrivedAt') : t('arrivesAt')} {trainObject?.actarr}
                                                <span style={{ fontSize: "0.9em" }}>
          {trainObject.arrlate < 0 ? `(${trainObject.arrlate})` : null}
                                                    {trainObject.arrlate > 0 ? `(+${trainObject.arrlate})` : null}
        </span>
                                            </Text>
                                        )
                                    )
                                }

                                {/* Отображение времени отправления */}
                                {
                                    (!trainObject?.actdep || trainObject.actdep === 'n/a') && trainObject?.depart !== "0" ? ( // Hide if depart === "0"
                                        trainObject?.depart !== '-' && (
                                            <Text size="xs" c={(!trainObject?.actarr && !trainObject?.actdep) ? "default" : "green"}>
                                                {trainObject.passyet === '1' ? t('departedAt') : t('departsAt')} {trainObject?.depart}
                                                {!trainObject?.actarr && !trainObject?.actdep && ' ' + t('nodata')}
                                            </Text>
                                        )
                                    ) : (
                                        trainObject?.actdep !== '-' && trainObject?.depart !== "0" && ( // Hide if depart === "0"
                                            <Text size="xs" c="#ff0000">
                                                {trainObject.passyet === '1' ? t('departedAt') : t('departsAt')} {trainObject?.actdep}
                                                <span style={{ fontSize: "0.9em" }}> (+{trainObject.deplate})</span>
                                            </Text>
                                        )
                                    )
                                }


                            </Timeline.Item>
                        ))}
                    </Timeline>
                }
            </Modal>
        <AppShell
            header={{ height: 60 }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md">
                    <Group justify="space-between" style={{ flex: 1 }}>
                        <Group align="center">
                            <LuTrainTrack />
                            <Text fw={1000} size="xl">KMITL - BKK</Text>
                        </Group>


                        <Group ml="xl" gap={'xs'}>
                            <Menu position="bottom" withArrow>
                                <Menu.Target>
                                    <ActionIcon>
                                        <IconLanguage size={16} />
                                    </ActionIcon>
                                </Menu.Target>

                                <Menu.Dropdown>
                                    {languages.map((lang) => (
                                        <Menu.Item
                                            key={lang.value}
                                            onClick={() => handleLanguageChange(lang.value)}
                                            style={{
                                                fontWeight: currentLanguage === lang.value ? 'bold' : 'normal',
                                            }}
                                        >
                                            {lang.label}
                                        </Menu.Item>
                                    ))}
                                </Menu.Dropdown>
                            </Menu>
                            <ActionIcon
                                onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
                                variant="default"
                                size="lg"
                                aria-label="Toggle color scheme"
                            >
                                <IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
                                <IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} />
                            </ActionIcon>
                            <ActionIcon
                                component="a"
                                href="https://github.com/TuskarMA/kmitl_train"
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="default"
                                size="lg"
                                aria-label="GitHub"
                            >
                                <IconBrandGithub size={18} />
                            </ActionIcon>



                        </Group>
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Main>
                <Tabs orientation='horizontal' variant="pills" defaultValue="from">
                    <Tabs.List>
                        <Group align="center">
                            <Tabs.Tab onClick={() => setDirection('from')} value="from" leftSection={<FaPersonArrowUpFromLine size={25} />}>
                                {t('fromKMITL')}
                            </Tabs.Tab>
                            <Tabs.Tab onClick={() => setDirection('to')} value="to" leftSection={<FaPersonArrowDownToLine size={25} />}>
                                {t('toKMITL')}
                            </Tabs.Tab>
                            {direction === 'to' && (
                                <Select
                                    placeholder={t('chooseStationFrom')}
                                    value={fromTo42}  // Bind the selected value to fromTo42 state
                                    data={
                                        Object.values(stationList)
                                        .sort((a, b) => a.order - b.order)
                                        .slice(0, -1)
                                        .map(station => station.name)
                                    }
                                    style={{ minWidth: 150 }} // Optional: Adjust width as needed
                                    onChange={(value) => {
                                        const selectedStation = Object.values(stationList).find(station => station.name === value);
                                        if(!selectedStation) return;
                                        const stationKey = Object.keys(stationList).find(key => stationList[key] === selectedStation);

                                        axios.get('/api/getStationTrainList?station=' + stationKey).then((response) => {
                                            setDataStation(response.data);
                                        });

                                        setFromTo42(value);

                                    }} // Update the state when a new value is selected
                                />
                            )}
                        </Group>
                    </Tabs.List>
                </Tabs>
                {
                    fromTo42 || direction === 'from'
                    ?
                        <>
                        <Table
                            withTableBorder
                            mt="xs"
                            striped
                            highlightOnHover
                        >
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>{t('table.number')}</Table.Th>
                                    <Table.Th>{t('table.fromTo')}</Table.Th>
                                    <Table.Th>{t('table.arrives')}</Table.Th>
                                    <Table.Th>{t('table.delay')}</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {dataStation === null && direction === 'to' ? (
                                    <tr>
                                        <td colSpan={4}>
                                            <Center>
                                                <Loader />
                                            </Center>
                                        </td>
                                    </tr>
                                ) : direction === 'to' ? (
                                    dataStation[direction + '42']?.length > 0 ? (
                                        dataStation[direction + '42'].map((trainObject, index) => (
                                            <Table.Tr style={{cursor: "pointer"}} key={index} onClick={() => handleRowClick(trainObject)}>
                                                <Table.Td>
                                                    {trainObject.trainid} <Badge>{trainObject.typeen}</Badge>
                                                </Table.Td>
                                                <Table.Td>
                                                    {trainObject.beginen} → {trainObject.enden}
                                                </Table.Td>
                                                <Table.Td>
                                                    {trainObject.predictarr !== 'begin' ? trainObject.predictarr : trainObject.predictdep}
                                                </Table.Td>
                                                <Table.Td>
                                                    {trainObject.delay === 0 || trainObject.delay === 'begin' ? 'On time' : trainObject.delay + ' min'}
                                                </Table.Td>
                                            </Table.Tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4}>
                                                <Center>{t('noMoreTrainsStation')}</Center>
                                            </td>
                                        </tr>
                                    )
                                ) : (
                                    data[direction + '42']?.length > 0 ? (
                                        data[direction + '42'].map((trainObject, index) => (
                                            <Table.Tr style={{cursor: "pointer"}} key={index} onClick={() => handleRowClick(trainObject)}>
                                                <Table.Td>
                                                    {trainObject.trainid} <Badge>{trainObject.typeen}</Badge>
                                                </Table.Td>
                                                <Table.Td>
                                                    {trainObject.beginen} → {trainObject.enden}
                                                </Table.Td>
                                                <Table.Td>
                                                    {trainObject.predictarr}
                                                </Table.Td>
                                                <Table.Td>
                                                    {trainObject.delay === 0 || trainObject.delay === 'begin' ? 'On time' : trainObject.delay + ' min'}
                                                </Table.Td>
                                            </Table.Tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4}>
                                                <Center>{t('noMoreTrainsTo')}</Center>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </Table.Tbody>



                        </Table>
                        </>
                        :
                        <></>
                }
            </AppShell.Main>

            <AppShell.Section>
                <Center m={'xs'}>
                    <Text ta={'center'} w={'auto'} fw={'200'} size={'xs'}>
                        {t('footer')} {new Date().getFullYear() === 2025 ? "2025" : "2025-" + new Date().getFullYear()}
                    </Text>
                </Center>
            </AppShell.Section>

        </AppShell>
        </>
    );
}
