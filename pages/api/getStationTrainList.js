// /pages/api/getStationTrainList.js
import axios from 'axios';
import NodeCache from 'node-cache';
import stationList from './stationList.json'

const myCache = new NodeCache({ stdTTL: 60, checkperiod: 70 }); // stdTTL = 60 секунд (1 минута)

export default async function handler(req, res) {
	const { station } = req.query;

	if (!station) return res.status(400).json({ success: false, error: "Missing 'station' query" });
	if (!stationList[station]) return res.status(400).json({ success: false, error: "Invalid 'station' query" });

	// Попытка извлечь данные из кэша
	const cachedData = myCache.get(station);
	if (cachedData) {
		// Возвращаем данные из кэша
		return res.status(200).json({station: stationList[station].name, success: true, cached: true, from42: cachedData.from42, to42: cachedData.to42 });
	}

	// Если кэш пуст или данные устарели, запрашиваем данные из API
	const response = await axios.post('https://ttsview.railway.co.th/checktrain_2023.php',
		`grant=user&station=${station}`,
		{
			headers: {
				'Referer': `https://ttsview.railway.co.th/searchresult_2023.php?station=${station}&lang=eng`
			}
		}).catch((err) => {
		console.error(err);
		return res.status(500).json({ success: false, error: 'Failed to fetch data' });
	});

	//console.log(response)

	if (!response.data) {
		response.data = []
		//return res.status(500).json({ success: false, error: 'Failed to fetch data' });
	}

	const keysToRemove = [
		"station_name", "train_type", "deptime", "station_name_ch",
		"from", "from_ch", "to", "to_ch", "beginth", "beginch",
		"endch", "endth", "curtime", "typeth"
	];

	const sanitizedData = response?.data?.map(obj => {
		const newObj = { ...obj };
		keysToRemove.forEach(key => delete newObj[key]);
		return newObj;
	});

	const lineFiltered = sanitizedData.filter(obj => obj.line === 3);

	// Разделяем данные на from42 и to42
	const from42 = lineFiltered.filter(obj => obj.beginen !== "Bangkok (Hua Lamphong)");
	const to42 = lineFiltered.filter(obj => obj.beginen === "Bangkok (Hua Lamphong)");

	// Сохраняем данные в кэш с ключом station
	myCache.set(station, { from42, to42 });

	// Возвращаем данные
	res.status(200).json({ station: stationList[station].name ,success: true, cached: false, from42, to42 });
}
