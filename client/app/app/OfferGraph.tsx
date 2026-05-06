import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function OfferGraph() {
  const { offerId } = useLocalSearchParams();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const res = await fetch(`${API_URL}/api/offers/offer-analytics/${offerId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
    const data = await res.json();

    setChartData(data.data || []);
  };

  const labels = chartData.map(d => d.date);
  const values = chartData.map(d => d.clicks);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
        Offer Click Analytics
      </Text>

      {values.length > 0 ? (
        <LineChart
          data={{
            labels,
            datasets: [{ data: values }]
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          yAxisInterval={1}
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 61, 165, ${opacity})`,
          }}
          style={{ marginTop: 20 }}
        />
      ) : (
        <Text>No data yet</Text>
      )}
    </View>
  );
}