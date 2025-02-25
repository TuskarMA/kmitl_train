// /pages/api/getTrainInfo.js
import axios from 'axios';
import NodeCache from 'node-cache';
import stationList from './stationList.json';

const myCache = new NodeCache({ stdTTL: 60, checkperiod: 70 }); // stdTTL = 60 секунд (1 минута)

export default async function handler(req, res) {
	const { train } = req.query;

	if (!train) return res.status(400).json({ success: false, error: "Missing 'train' query" });

	// Попытка извлечь данные из кэша
	const cachedData = myCache.get(train);
	if (cachedData) {
		return res.status(200).json({ success: true, cached: true, data: cachedData});
	}

	// Если кэша нет, запрашиваем данные из API
	const response = await axios.post('https://ttsview.railway.co.th/checktrain_2023.php',
		`grant=user&train=${train}&date=`,
		{
			headers: {
				'Referer': `https://ttsview.railway.co.th/searchresult_2023.php?trainno=${train}&lang=eng`
			}
		}).catch((err) => {
		console.error(err);
		return res.status(500).json({ success: false, error: 'Failed to fetch data' });
	});

	if (!response.data) {
		return res.status(500).json({ success: false, error: 'Failed to fetch data' });
	}

	// Удаление ненужных ключей
	const keysToRemove = ["now", "latestth", "latestch", "nextch", "nextth"];
	const keysToRemoveFromRight = ["stth", "stch"];

	const newObj = { ...response.data, trainid: train };

	if (newObj.right && Array.isArray(newObj.right)) {
		newObj.right.forEach((rightObj) => {
			keysToRemoveFromRight.forEach(key => delete rightObj[key]);
		});
	}

	if (newObj.left) {
		keysToRemove.forEach(key => delete newObj.left[key]);
	}

	// Кэшируем данные
	myCache.set(train, newObj);

	// Возвращаем данные
	res.status(200).json({ success: true, cached: false, data: newObj});
}
