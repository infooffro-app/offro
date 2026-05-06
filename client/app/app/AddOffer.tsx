// // screens/app/AddOfferScreen.js - Add New Offer
// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   Alert,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { useRouter } from 'expo-router';
// import { Dropdown } from 'react-native-element-dropdown';

// const API_URL = process.env.EXPO_PUBLIC_API_URL;

// const AXIS_COLORS = {
//   primary: '#003DA5',
//   secondary: '#4A90E2',
//   lightBg: '#E8F1F8',
//   text: '#1A1A1A',
//   white: '#FFFFFF',
//   border: '#D0E0F0',
// };

// export default function AddOfferScreen() {
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     shop_id: '',
//     title: '',
//     description: '',
//     discountType: 'percentage',
//     discountValue: '',
//     couponCode: '',
//     validFrom: '',
//     validUntil: '',
//   });
//   const [loading, setLoading] = useState(false);
//   const [shopData, setShopData] = useState([]);
//   const [slectedShopId, setSlectedShop] = useState(null);
//   const [focusedField, setFocusedField] = useState(null);
//   const [showFromPicker, setShowFromPicker] = useState(false);
//   const [showUntilPicker, setShowUntilPicker] = useState(false);

//   const handleChange = (field, value) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const validateForm = () => {
//     if (!formData.title.trim()) {
//       Alert.alert('Required', 'Please enter offer title');
//       return false;
//     }
//     if (!formData.discountValue) {
//       Alert.alert('Required', 'Please enter discount value');
//       return false;
//     }
//     if (!formData.validFrom || !formData.validUntil) {
//       Alert.alert('Required', 'Please enter valid dates');
//       return false;
//     }
//     return true;
//   };

//   useEffect(() => {
//     const init = async () => {
//       shopList();
//     };

//     init();
//   }, []);

//   const shopList = async ()=>{
//     try {
//       const token = await AsyncStorage.getItem('userToken');

//       // ✅ Step 1: Check shop
//       const shopRes = await fetch(`${API_URL}/api/shop/myShop`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const data = await shopRes.json();
//       setShopData(data);

//       if (!shopRes.ok) {
//         Alert.alert('Error', 'Please add shop first');
//         setLoading(false);
//         return;
//       }

//     } catch (error) {
//       console.log(error);
//       Alert.alert('Error', 'Server error');
//     }
//   }

//   const handlePostOffer = async () => {
//     if (!validateForm()) return;

//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem('userToken');

//       // ✅ Step 1: Check shop
//       const shopRes = await fetch(`${API_URL}/api/shop/myShop`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const shopData = await shopRes.json();
//       console.log(shopData);
//       if (!shopRes.ok) {
//         Alert.alert('Error', 'Please add shop first');
//         setLoading(false);
//         return;
//       }

//       // ✅ Step 2: Prepare payload
//       const payload = {
//         shop_id: formData.shop_id,
//         title: formData.title,
//         description: formData.description,
//         validFrom: formData.validFrom,
//         validUntil: formData.validUntil,
//         couponCode: formData.couponCode,
//       };

//       if (formData.discountType === 'percentage') {
//         payload.discountPercentage = parseInt(formData.discountValue);
//       } else {
//         payload.discountAmount = parseFloat(formData.discountValue);
//       }

//       // ✅ Step 3: Post offer
//       const response = await fetch(`${API_URL}/api/shop/offers`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         Alert.alert('Success', 'Offer posted successfully 🎉');
//         router.push('/app/Dashboard');
//       } else {
//         Alert.alert('Error', data.error || 'Failed');
//       }

//     } catch (error) {
//       console.log(error);
//       Alert.alert('Error', 'Server error');
//     }

//     setLoading(false);
//   };

//   const formatDate = (date) => {
//     if (new Date(formData.validUntil) < new Date(formData.validFrom)) {
//       Alert.alert('Invalid Date', 'Valid Until must be after Valid From');
//       return;
//     }
//     return date.toISOString().split('T')[0]; // YYYY-MM-DD
//   };

//   console.log(shopData);

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       style={styles.container}
//     >
//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity style={styles.backButton} onPress={() => router.push('/app/Dashboard')}>
//             <Text style={styles.backText}>← Back</Text>
//           </TouchableOpacity>
//           <Text style={styles.title}>Create New Offer</Text>
//           <Text style={styles.subtitle}>Post an amazing deal</Text>
//         </View>

//         {/* Form Card */}
//         <View style={styles.formCard}>

//            {/* Select Shop */}
//           <View style={styles.inputSection}>
//             <Text style={styles.label}>Shops</Text>
//             <View style={styles.inputContainer}>
//               <Dropdown
//                 style={{ flex: 1 }}
//                 data={shopData}
//                 labelField="shop_name"
//                 valueField="id"
//                 placeholder="Select Shop"
//                 value={slectedShopId}
//                 onChange={(item) => {
//                   setSlectedShop(item.id);
//                   handleChange('shop_id', item.id);
//                 }}
//               />
//             </View>
//           </View>


//           {/* Offer Title */}
//           <View style={styles.inputSection}>
//             <Text style={styles.label}>Offer Title</Text>
//             <View
//               style={[
//                 styles.inputContainer,
//                 focusedField === 'title' && styles.inputContainerFocused,
//               ]}
//             >
//               <Text style={styles.inputIcon}>📝</Text>
//               <TextInput
//                 placeholder="e.g., 50% Off on Coffee"
//                 style={styles.input}
//                 value={formData.title}
//                 onChangeText={(value) => handleChange('title', value)}
//                 placeholderTextColor="#999"
//                 editable={!loading}
//                 onFocus={() => setFocusedField('title')}
//                 onBlur={() => setFocusedField(null)}
//                 maxLength={50}
//               />
//             </View>
//             <Text style={styles.charCount}>{formData.title.length}/50</Text>
//           </View>

//           {/* Description */}
//           <View style={styles.inputSection}>
//             <Text style={styles.label}>Description</Text>
//             <View
//               style={[
//                 styles.inputContainer,
//                 focusedField === 'description' && styles.inputContainerFocused,
//                 styles.textAreaContainer,
//               ]}
//             >
//               <Text style={styles.inputIcon}>📄</Text>
//               <TextInput
//                 placeholder="Add offer details..."
//                 style={[styles.input, styles.textArea]}
//                 value={formData.description}
//                 onChangeText={(value) => handleChange('description', value)}
//                 placeholderTextColor="#999"
//                 editable={!loading}
//                 onFocus={() => setFocusedField('description')}
//                 onBlur={() => setFocusedField(null)}
//                 multiline
//                 numberOfLines={4}
//                 maxLength={200}
//               />
//             </View>
//             <Text style={styles.charCount}>{formData.description.length}/200</Text>
//           </View>

//           {/* Coupon Code */}
//           <View style={styles.inputSection}>
//             <Text style={styles.label}>Coupon Code (Optional)</Text>
//             <View
//               style={[
//                 styles.inputContainer,
//                 focusedField === 'couponCode' && styles.inputContainerFocused,
//               ]}
//             >
//               <Text style={styles.inputIcon}>🎟️</Text>
//               <TextInput
//                 placeholder="e.g., SAVE50"
//                 style={styles.input}
//                 value={formData.couponCode}
//                 onChangeText={(value) => handleChange('couponCode', value)}
//                 placeholderTextColor="#999"
//                 editable={!loading}
//                 onFocus={() => setFocusedField('couponCode')}
//                 onBlur={() => setFocusedField(null)}
//               />
//             </View>
//           </View>

//           {/* Discount Type Toggle */}
//           <View style={styles.inputSection}>
//             <Text style={styles.label}>Discount Type</Text>
//             <View style={styles.toggleContainer}>
//               <TouchableOpacity
//                 style={[
//                   styles.toggleButton,
//                   formData.discountType === 'percentage' && styles.toggleButtonActive,
//                 ]}
//                 onPress={() => handleChange('discountType', 'percentage')}
//               >
//                 <Text style={[styles.toggleIcon, formData.discountType === 'percentage' && styles.toggleTextActive,]}>%</Text>
//                 <Text
//                   style={[
//                     styles.toggleText,
//                     formData.discountType === 'percentage' && styles.toggleTextActive,
//                   ]}
//                 >
//                   Percentage
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[
//                   styles.toggleButton,
//                   formData.discountType === 'amount' && styles.toggleButtonActive,
//                 ]}
//                 onPress={() => handleChange('discountType', 'amount')}
//               >
//                 <Text style={[styles.toggleIcon, formData.discountType === 'amount' && styles.toggleTextActive,]}>₹</Text>
//                 <Text
//                   style={[
//                     styles.toggleText,
//                     formData.discountType === 'amount' && styles.toggleTextActive,
//                   ]}
//                 >
//                   Amount
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* Discount Value */}
//           <View style={styles.inputSection}>
//             <Text style={styles.label}>
//               Discount Value ({formData.discountType === 'percentage' ? '%' : '₹'})
//             </Text>
//             <View
//               style={[
//                 styles.inputContainer,
//                 focusedField === 'discountValue' && styles.inputContainerFocused,
//               ]}
//             >
//               <Text style={styles.inputIcon}>{formData.discountType === 'percentage' ? '%' : '₹'}</Text>
//               <TextInput
//                 placeholder="Enter value"
//                 style={styles.input}
//                 value={formData.discountValue}
//                 onChangeText={(value) => handleChange('discountValue', value)}
//                 keyboardType="numeric"
//                 placeholderTextColor="#999"
//                 editable={!loading}
//                 onFocus={() => setFocusedField('discountValue')}
//                 onBlur={() => setFocusedField(null)}
//               />
//             </View>
//           </View>

//           {/* Date Range */}
//           <View style={styles.dateRow}>

//             {/* VALID FROM */}
//             <View style={[styles.inputSection, { flex: 1 }]}>
//               <Text style={styles.label}>Valid From</Text>

//               <TouchableOpacity
//                 style={styles.inputContainer}
//                 onPress={() => setShowFromPicker(true)}
//               >
//                 <Text style={styles.inputIcon}>📅</Text>
//                 <Text style={styles.input}>
//                   {formData.validFrom || 'Select Date'}
//                 </Text>
//               </TouchableOpacity>

//               {showFromPicker && (
//                 <DateTimePicker
//                   value={formData.validFrom ? new Date(formData.validFrom) : new Date()}
//                   mode="date"
//                   display="default"
//                   minimumDate={new Date()}
//                   onChange={(event, selectedDate) => {
//                     setShowFromPicker(false);
//                     if (selectedDate) {
//                       handleChange('validFrom', formatDate(selectedDate));
//                     }
//                   }}
//                 />
//               )}
//             </View>

//             {/* VALID UNTIL */}
//             <View style={[styles.inputSection, { flex: 1, marginLeft: 10 }]}>
//               <Text style={styles.label}>Valid Until</Text>

//               <TouchableOpacity
//                 style={styles.inputContainer}
//                 onPress={() => setShowUntilPicker(true)}
//               >
//                 <Text style={styles.inputIcon}>📅</Text>
//                 <Text style={styles.input}>
//                   {formData.validUntil || 'Select Date'}
//                 </Text>
//               </TouchableOpacity>

//               {showUntilPicker && (
//                 <DateTimePicker
//                   value={formData.validUntil ? new Date(formData.validUntil) : new Date()}
//                   mode="date"
//                   display="default"
//                   minimumDate={
//                     formData.validFrom 
//                       ? new Date(formData.validFrom) 
//                       : new Date()
//                   }
//                   onChange={(event, selectedDate) => {
//                     setShowUntilPicker(false);
//                     if (selectedDate) {
//                       handleChange('validUntil', formatDate(selectedDate));
//                     }
//                   }}
//                 />
//               )}
//             </View>

//           </View>

//           {/* Post Button */}
//           <TouchableOpacity
//             style={[styles.postButton, loading && styles.buttonDisabled]}
//             onPress={handlePostOffer}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator size="small" color={AXIS_COLORS.white} />
//             ) : (
//               <>
//                 <Text style={styles.postButtonIcon}>🚀</Text>
//                 <Text style={styles.postButtonText}>Post Offer</Text>
//               </>
//             )}
//           </TouchableOpacity>

//           {/* Tips */}
//           <View style={styles.tipsBox}>
//             <Text style={styles.tipsIcon}>💡</Text>
//             <View>
//               <Text style={styles.tipsTitle}>Pro Tips:</Text>
//               <Text style={styles.tipText}>• Clear titles get more views</Text>
//               <Text style={styles.tipText}>• Higher discounts = more clicks</Text>
//               <Text style={styles.tipText}>• Set reasonable expiry dates</Text>
//             </View>
//           </View>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: AXIS_COLORS.lightBg,
//   },
//   scrollContent: {
//     paddingBottom: 40,
//   },
//   header: {
//     backgroundColor: AXIS_COLORS.primary,
//     paddingHorizontal: 20,
//     paddingTop: 50,
//     paddingBottom: 30,
//     borderBottomLeftRadius: 25,
//     borderBottomRightRadius: 25,
//   },
//   backButton: {
//     marginBottom: 12,
//   },
//   backText: {
//     fontSize: 16,
//     color: AXIS_COLORS.white,
//     fontWeight: '700',
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '800',
//     color: AXIS_COLORS.white,
//   },
//   subtitle: {
//     fontSize: 13,
//     color: AXIS_COLORS.lightBg,
//     marginTop: 8,
//     fontWeight: '500',
//   },
//   formCard: {
//     backgroundColor: AXIS_COLORS.white,
//     marginHorizontal: 16,
//     marginTop: 20,
//     paddingHorizontal: 20,
//     paddingVertical: 24,
//     borderRadius: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.15,
//     shadowRadius: 20,
//     elevation: 8,
//     marginBottom: 20,
//   },
//   inputSection: {
//     marginBottom: 16,
//   },
//   label: {
//     fontSize: 12,
//     fontWeight: '700',
//     color: AXIS_COLORS.text,
//     marginBottom: 6,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     backgroundColor: AXIS_COLORS.lightBg,
//     borderRadius: 10,
//     borderWidth: 2,
//     borderColor: AXIS_COLORS.border,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//   },
//   textAreaContainer: {
//     alignItems: 'flex-start',
//     minHeight: 100,
//   },
//   inputContainerFocused: {
//     borderColor: AXIS_COLORS.primary,
//     backgroundColor: AXIS_COLORS.white,
//   },
//   inputIcon: {
//     fontSize: 16,
//     marginRight: 8,
//     marginTop: 4,
//   },
//   input: {
//     flex: 1,
//     fontSize: 14,
//     color: AXIS_COLORS.text,
//     fontWeight: '500',
//   },
//   textArea: {
//     minHeight: 80,
//     textAlignVertical: 'top',
//     paddingVertical: 8,
//   },
//   charCount: {
//     fontSize: 11,
//     color: '#999',
//     marginTop: 4,
//     fontWeight: '600',
//     textAlign: 'right',
//   },
//   toggleContainer: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   toggleButton: {
//     flex: 1,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderRadius: 10,
//     borderWidth: 2,
//     borderColor: AXIS_COLORS.border,
//     alignItems: 'center',
//     backgroundColor: AXIS_COLORS.lightBg,
//   },
//   toggleButtonActive: {
//     backgroundColor: AXIS_COLORS.primary,
//     borderColor: AXIS_COLORS.primary,
//   },
//   toggleIcon: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 4,
//   },
//   toggleText: {
//     fontSize: 11,
//     color: AXIS_COLORS.text,
//     fontWeight: '700',
//   },
//   toggleTextActive: {
//     color: AXIS_COLORS.white,
//   },
//   dateRow: {
//     flexDirection: 'row',
//     marginBottom: 16,
//   },
//   postButton: {
//     backgroundColor: AXIS_COLORS.primary,
//     flexDirection: 'row',
//     height: 54,
//     borderRadius: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 16,
//     shadowColor: AXIS_COLORS.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 12,
//     elevation: 5,
//     gap: 8,
//   },
//   buttonDisabled: {
//     opacity: 0.6,
//   },
//   postButtonIcon: {
//     fontSize: 18,
//   },
//   postButtonText: {
//     color: AXIS_COLORS.white,
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   tipsBox: {
//     backgroundColor: AXIS_COLORS.lightBg,
//     borderLeftWidth: 4,
//     borderLeftColor: AXIS_COLORS.primary,
//     padding: 12,
//     borderRadius: 8,
//     flexDirection: 'row',
//   },
//   tipsIcon: {
//     fontSize: 20,
//     marginRight: 10,
//   },
//   tipsTitle: {
//     fontSize: 12,
//     fontWeight: '800',
//     color: AXIS_COLORS.primary,
//     marginBottom: 6,
//   },
//   tipText: {
//     fontSize: 11,
//     color: AXIS_COLORS.primary,
//     fontWeight: '500',
//     marginBottom: 2,
//     lineHeight: 16,
//   },
// });



// screens/app/AddOfferScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Dropdown } from 'react-native-element-dropdown';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const AXIS_COLORS = {
  primary: '#003DA5',
  secondary: '#4A90E2',
  lightBg: '#E8F1F8',
  text: '#1A1A1A',
  white: '#FFFFFF',
  border: '#D0E0F0',
};

export default function AddOfferScreen() {
  const router = useRouter();

  // ── Read edit params ─────────────────────────────────────────────────────
  const params = useLocalSearchParams();
  
  const isEditMode = params.editMode === 'true';
  const offerId = params.offerId;
  const [selectedShopId, setSelectedShop] = useState(
    params.shop_id ? Number(params.shop_id) : null
  );
  const [formData, setFormData] = useState({
    shop_id: params.shop_id ? Number(params.shop_id) : '',
    title: params.title || '',
    description: params.description || '',
    discountType: params.discountType || 'percentage',
    discountValue: params.discountValue || '',
    couponCode: params.couponCode || '',
    validFrom: params.validFrom || '',
    validUntil: params.validUntil || '',
  });

  const [loading, setLoading] = useState(false);
  const [shopData, setShopData] = useState([]);
  const [focusedField, setFocusedField] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showUntilPicker, setShowUntilPicker] = useState(false);



  useEffect(() => { shopList(); }, []);

  const shopList = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const shopRes = await fetch(`${API_URL}/api/shop/myShop`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await shopRes.json();
      setShopData(data);
      if (!shopRes.ok) {
        Alert.alert('Error', 'Please add shop first');
      }
    } catch (error) {
      Alert.alert('Error', 'Server error');
    }
  };

  const validateForm = () => {
     if (!formData.shop_id) {
      Alert.alert('Required', 'Please select shop');
      return false;
    }
    if (!formData.title.trim()) {
      Alert.alert('Required', 'Please enter offer title');
      return false;
    }
    if (!formData.discountValue) {
      Alert.alert('Required', 'Please enter discount value');
      return false;
    }
    if (!formData.validFrom || !formData.validUntil) {
      Alert.alert('Required', 'Please enter valid dates');
      return false;
    }
    return true;
  };

  // ── Create OR Update ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
  if (!validateForm()) return;
  setLoading(true);

  try {
    const token = await AsyncStorage.getItem('userToken');

    if (!token) {
      Alert.alert('Error', 'Not logged in');
      setLoading(false);
      return;
    }

    const payload: any = {
      shop_id:     formData.shop_id,
      title:       formData.title,
      description: formData.description,
      validFrom:   formData.validFrom,
      validUntil:  formData.validUntil,
      couponCode:  formData.couponCode,
    };

    if (formData.discountType === 'percentage') {
      payload.discountPercentage = parseInt(formData.discountValue);
    } else {
      payload.discountAmount = parseFloat(formData.discountValue);
    }

    const url = isEditMode
      ? `${API_URL}/api/offers/offers/${offerId}`
      : `${API_URL}/api/offers/offers`;

    // ← Log everything before fetch
    // console.log('=== SUBMIT DEBUG ===');
    // console.log('isEditMode:', isEditMode);
    // console.log('offerId:', offerId);
    // console.log('url:', url);
    // console.log('payload:', JSON.stringify(payload, null, 2));
    // console.log('token exists:', token);

    const response = await fetch(url, {
      method: isEditMode ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    // ← Read raw text first before parsing
    const rawText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response body:', rawText);

    // ← Safely parse JSON
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      console.log('JSON parse failed, raw response:', rawText);
      Alert.alert('Error', `Server returned invalid response: ${rawText.slice(0, 100)}`);
      setLoading(false);
      return;
    }

    if (response.ok) {
      Alert.alert(
        'Success',
        isEditMode ? 'Offer updated successfully ✅' : 'Offer posted successfully 🎉'
      );
      router.push('/app/Dashboard');
    } else {
      Alert.alert('Error', data.error || data.message || `Failed with status ${response.status}`);
    }

  } catch (error: any) {
    // ← Show actual error message
    console.log('=== CATCH ERROR ===');
    console.log('Error name:', error?.name);
    console.log('Error message:', error?.message);
    console.log('Full error:', error);
    Alert.alert('Error', `${error?.message || 'Unknown error'}`);
  }

  setLoading(false);
};

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const handleChange = (field, value) => {
  console.log(field,value);
  setFormData(prev => ({ ...prev, [field]: value }));
};


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <View style={styles.backRow}>
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backText}>
                {isEditMode ? 'My Offers' : 'Dashboard'}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.headerIconWrap}>
              <Text style={styles.headerIcon}>{isEditMode ? '✏️' : '🏷️'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>
                {isEditMode ? 'Edit Offer' : 'Create Offer'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {isEditMode
                  ? 'Update your deal details below'
                  : 'Post an amazing deal for nearby customers'}
              </Text>
            </View>
          </View>

          {/* Edit mode banner */}
          {isEditMode && (
            <View style={styles.editBanner}>
              <Text style={styles.editBannerIcon}>📋</Text>
              <Text style={styles.editBannerText}>
                Editing: <Text style={styles.editBannerBold}>{params.title}</Text>
              </Text>
            </View>
          )}
        </View>

        {/* ── Form Card ── */}
        <View style={styles.formCard}>

          {/* Select Shop */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Shop</Text>
            <View style={styles.inputContainer}>
              <Dropdown
                style={{ flex: 1 }}
                data={shopData}
                labelField="shop_name"
                valueField="id"
                placeholder="Select Shop"
                value={selectedShopId}           // ← now a Number, matches item.id
                dropdownPosition="bottom"
                search={false}
                onChange={(item) => {
                  setSelectedShop(item.id);
                  handleChange('shop_id', item.id);
                }}
              />
            </View>
          </View>

          {/* Offer Title */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Offer Title</Text>
            <View style={[
              styles.inputContainer,
              focusedField === 'title' && styles.inputContainerFocused,
            ]}>
              <Text style={styles.inputIcon}>📝</Text>
              <TextInput
                placeholder="e.g., 50% Off on Coffee"
                style={styles.input}
                value={formData.title}
                onChangeText={(v) => handleChange('title', v)}
                placeholderTextColor="#999"
                editable={!loading}
                onFocus={() => setFocusedField('title')}
                onBlur={() => setFocusedField(null)}
                maxLength={50}
              />
            </View>
            <Text style={styles.charCount}>{formData.title.length}/50</Text>
          </View>

          {/* Description */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Description</Text>
            <View style={[
              styles.inputContainer,
              focusedField === 'description' && styles.inputContainerFocused,
              styles.textAreaContainer,
            ]}>
              <Text style={styles.inputIcon}>📄</Text>
              <TextInput
                placeholder="Add offer details..."
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(v) => handleChange('description', v)}
                placeholderTextColor="#999"
                editable={!loading}
                onFocus={() => setFocusedField('description')}
                onBlur={() => setFocusedField(null)}
                multiline
                numberOfLines={4}
                maxLength={200}
              />
            </View>
            <Text style={styles.charCount}>{formData.description.length}/200</Text>
          </View>

          {/* Coupon Code */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Coupon Code (Optional)</Text>
            <View style={[
              styles.inputContainer,
              focusedField === 'couponCode' && styles.inputContainerFocused,
            ]}>
              <Text style={styles.inputIcon}>🎟️</Text>
              <TextInput
                placeholder="e.g., SAVE50"
                style={styles.input}
                value={formData.couponCode}
                onChangeText={(v) => handleChange('couponCode', v)}
                placeholderTextColor="#999"
                editable={!loading}
                onFocus={() => setFocusedField('couponCode')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* Discount Type Toggle */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Discount Type</Text>
            <View style={styles.toggleContainer}>
              {[
                { key: 'percentage', icon: '%', label: 'Percentage' },
                { key: 'amount', icon: '₹', label: 'Amount' },
              ].map(({ key, icon, label }) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.toggleButton,
                    formData.discountType === key && styles.toggleButtonActive,
                  ]}
                  onPress={() => handleChange('discountType', key)}
                >
                  <Text style={[
                    styles.toggleIcon,
                    formData.discountType === key && styles.toggleTextActive,
                  ]}>{icon}</Text>
                  <Text style={[
                    styles.toggleText,
                    formData.discountType === key && styles.toggleTextActive,
                  ]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Discount Value */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>
              Discount Value ({formData.discountType === 'percentage' ? '%' : '₹'})
            </Text>
            <View style={[
              styles.inputContainer,
              focusedField === 'discountValue' && styles.inputContainerFocused,
            ]}>
              <Text style={styles.inputIcon}>
                {formData.discountType === 'percentage' ? '%' : '₹'}
              </Text>
              <TextInput
                placeholder="Enter value"
                style={styles.input}
                value={formData.discountValue}
                onChangeText={(v) => handleChange('discountValue', v)}
                keyboardType="numeric"
                placeholderTextColor="#999"
                editable={!loading}
                onFocus={() => setFocusedField('discountValue')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* Date Row */}
          <View style={styles.dateRow}>
            {/* Valid From */}
            <View style={[styles.inputSection, { flex: 1 }]}>
              <Text style={styles.label}>Valid From</Text>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShowFromPicker(true)}
              >
                <Text style={styles.inputIcon}>📅</Text>
                <Text style={[styles.input, !formData.validFrom && { color: '#999' }]}>
                  {formData.validFrom || 'Select Date'}
                </Text>
              </TouchableOpacity>
              {showFromPicker && (
                <DateTimePicker
                  value={formData.validFrom ? new Date(formData.validFrom) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}  // ← fixes Android calendar not showing
                  minimumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowFromPicker(Platform.OS === 'ios');  // ← iOS needs manual close
                    if (event.type === 'set' && selectedDate) {   // ← 'set' means user confirmed
                      handleChange('validFrom', formatDate(selectedDate));
                    }
                  }}
                />
              )}
            </View>

            {/* Valid Until */}
            <View style={[styles.inputSection, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>Valid Until</Text>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShowUntilPicker(true)}
              >
                <Text style={styles.inputIcon}>📅</Text>
                <Text style={[styles.input, !formData.validUntil && { color: '#999' }]}>
                  {formData.validUntil || 'Select Date'}
                </Text>
              </TouchableOpacity>
              {showUntilPicker && (
                <DateTimePicker
                  value={formData.validUntil ? new Date(formData.validUntil) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  minimumDate={formData.validFrom ? new Date(formData.validFrom) : new Date()}
                  onChange={(event, selectedDate) => {
                    setShowUntilPicker(Platform.OS === 'ios');
                    if (event.type === 'set' && selectedDate) {
                      handleChange('validUntil', formatDate(selectedDate));
                    }
                  }}
                />
              )}
            </View>
          </View>

          {/* ── Submit Button ── */}
          <TouchableOpacity
            style={[
              styles.postButton,
              isEditMode && styles.updateButton,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={AXIS_COLORS.white} />
            ) : (
              <>
                <Text style={styles.postButtonIcon}>
                  {isEditMode ? '✅' : '🚀'}
                </Text>
                <Text style={styles.postButtonText}>
                  {isEditMode ? 'Update Offer' : 'Post Offer'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* ── Tips ── */}
          <View style={styles.tipsBox}>
            <View style={styles.tipsHeader}>
              <Text style={styles.tipsIconBig}>💡</Text>
              <Text style={styles.tipsTitle}>Tips for a great offer</Text>
            </View>
            <View style={styles.tipsList}>
              {[
                { icon: '📝', tip: 'Clear, specific titles get 3× more clicks' },
                { icon: '💰', tip: 'Discounts above 20% drive more footfall' },
                { icon: '📅', tip: 'Keep validity 7–14 days for urgency' },
                { icon: '🎟️', tip: 'Coupon codes help track redemptions' },
              ].map(({ icon, tip }, i) => (
                <View key={i} style={styles.tipItem}>
                  <Text style={styles.tipItemIcon}>{icon}</Text>
                  <Text style={styles.tipItemText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AXIS_COLORS.lightBg },
  scrollContent: { paddingBottom: 40 },

  // ── Header ──
  header: {
    backgroundColor: AXIS_COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backButton: { marginBottom: 16 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backArrow: { fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: '700' },
  backText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  headerContent: {
    flexDirection: 'row', alignItems: 'center',
    gap: 14, marginBottom: 16,
  },
  headerIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  headerIcon: { fontSize: 22 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSubtitle: {
    fontSize: 12, color: 'rgba(255,255,255,0.65)',
    marginTop: 3, fontWeight: '500',
  },

  // Edit mode banner
  editBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  editBannerIcon: { fontSize: 14 },
  editBannerText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '500', flex: 1 },
  editBannerBold: { fontWeight: '800', color: '#fff' },

  // ── Form Card ──
  formCard: {
    backgroundColor: AXIS_COLORS.white,
    marginHorizontal: 16, marginTop: 20,
    paddingHorizontal: 20, paddingVertical: 24,
    borderRadius: 16, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12,
    marginBottom: 20,
  },
  inputSection: { marginBottom: 16 },
  label: {
    fontSize: 11, fontWeight: '700', color: AXIS_COLORS.text,
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: AXIS_COLORS.lightBg,
    borderRadius: 10, borderWidth: 1.5,
    borderColor: AXIS_COLORS.border,
    paddingHorizontal: 12, paddingVertical: 11,
  },
  textAreaContainer: { alignItems: 'flex-start', minHeight: 100 },
  inputContainerFocused: {
    borderColor: AXIS_COLORS.primary,
    backgroundColor: AXIS_COLORS.white,
  },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: AXIS_COLORS.text, fontWeight: '500' },
  textArea: { minHeight: 80, textAlignVertical: 'top', paddingVertical: 4 },
  charCount: {
    fontSize: 11, color: '#999', marginTop: 4,
    fontWeight: '600', textAlign: 'right',
  },
  toggleContainer: { flexDirection: 'row', gap: 10 },
  toggleButton: {
    flex: 1, paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: 10, borderWidth: 1.5,
    borderColor: AXIS_COLORS.border, alignItems: 'center',
    backgroundColor: AXIS_COLORS.lightBg,
  },
  toggleButtonActive: {
    backgroundColor: AXIS_COLORS.primary,
    borderColor: AXIS_COLORS.primary,
  },
  toggleIcon: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  toggleText: { fontSize: 11, color: AXIS_COLORS.text, fontWeight: '700' },
  toggleTextActive: { color: AXIS_COLORS.white },
  dateRow: { flexDirection: 'row', marginBottom: 16 },

  // ── Buttons ──
  postButton: {
    backgroundColor: AXIS_COLORS.primary,
    flexDirection: 'row', height: 54,
    borderRadius: 12, alignItems: 'center',
    justifyContent: 'center', marginBottom: 16,
    elevation: 3, gap: 8,
  },
  updateButton: {
    backgroundColor: '#16A34A', // green for update
  },
  buttonDisabled: { opacity: 0.6 },
  postButtonIcon: { fontSize: 18 },
  postButtonText: { color: AXIS_COLORS.white, fontSize: 16, fontWeight: '700' },

  // ── Tips ──
  tipsBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  tipsHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginBottom: 10,
  },
  tipsIconBig: { fontSize: 16 },
  tipsTitle: { fontSize: 13, fontWeight: '800', color: '#1D4ED8' },
  tipsList: { gap: 7 },
  tipItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  tipItemIcon: { fontSize: 13, marginTop: 1 },
  tipItemText: {
    flex: 1, fontSize: 12, color: '#1E40AF',
    fontWeight: '500', lineHeight: 17,
  },
});