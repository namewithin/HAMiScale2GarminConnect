import axios, { AxiosResponse } from 'axios';
import { config } from 'dotenv';

config();

const { HOME_ASSISTANT_API_URL: homeAssistantApiUrl, YAGCC_API_URL: yagccApiUrl, BODYMISCALE_NAME, USER_NAME } = process.env;
const bodymiscale_name = BODYMISCALE_NAME || USER_NAME;

interface SensorData {
  attributes: {
    bmi: string;
    body_fat: string;
    body_type: string;
    bone_mass: string;
    metabolic_age: string;
    muscle_mass: string;
    visceral_fat: string;
    water: string;
    weight: string;
  };
}

const fetchFromApi = async (url: string): Promise<AxiosResponse<SensorData>> => {
  return await axios.get(url, {
    headers: {
      Authorization: `Bearer ${process.env.HOME_ASSISTANT_ACCESS_TOKEN}`,
    },
  });
};

const fetchSensorData = async (): Promise<void> => {
  try {
    const response = await fetchFromApi(`${homeAssistantApiUrl}/api/states/bodymiscale.${bodymiscale_name}`);
    const {
      attributes: {
        bmi,
        body_fat,
        body_type,
        bone_mass,
        metabolic_age,
        muscle_mass,
        visceral_fat,
        water,
        weight,
      },
    } = response.data;

    const yagccPayload = {
      bodyMassIndex: parseFloat(bmi),
      boneMass: parseFloat(bone_mass),
      email: process.env.GARMIN_EMAIL,
      metabolicAge: parseFloat(metabolic_age),
      muscleMass: parseFloat(muscle_mass),
      password: process.env.GARMIN_PASSWORD,
      percentFat: parseFloat(body_fat),
      percentHydration: parseFloat(water),
      physiqueRating: parseFloat(body_type),
      timeStamp: -1,
      visceralFatRating: parseFloat(visceral_fat),
      weight: parseFloat(weight),
    };

    if (yagccApiUrl) {
      const yagccResponse: AxiosResponse = await axios.post(yagccApiUrl+'/upload', yagccPayload);

      if (yagccResponse.status !== 201) {
        console.log("response status: ", yagccResponse.status); // Log the HTTP status code
        console.log("response data: ", yagccResponse.data);
      }
    } else {
      console.log("yagcc api url is undefined.");
    }
  } catch (error) {
    console.error("error: ", (error as Error).message);
  }
};

fetchSensorData();
