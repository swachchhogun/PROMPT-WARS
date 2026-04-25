// ==========================================
// INDIA ELECTORAL DATA — States, Districts, Lok Sabha Constituencies
// ==========================================
const INDIA_DATA = {
    "Andhra Pradesh": {
        districts: ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa", "Alluri Sitharama Raju", "Anakapalli", "Annamayya", "Bapatla", "Eluru", "Kakinada", "Konaseema", "Nandyal", "Palnadu", "Parvathipuram Manyam", "Sri Sathya Sai", "Tirupati"],
        constituencies: ["Araku", "Srikakulam", "Vizianagaram", "Visakhapatnam", "Anakapalli", "Kakinada", "Amalapuram", "Rajahmundry", "Narasapuram", "Eluru", "Machilipatnam", "Vijayawada", "Guntur", "Narasaraopet", "Bapatla", "Ongole", "Nandyal", "Kurnool", "Anantapur", "Hindupur", "Kadapa", "Nellore", "Tirupati", "Rajampet", "Chittoor"]
    },
    "Arunachal Pradesh": {
        districts: ["Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey", "Lower Subansiri", "Upper Subansiri", "West Siang", "East Siang", "Upper Siang", "Changlang", "Tirap", "Lohit", "Anjaw", "Longding", "Namsai", "Itanagar Capital Complex"],
        constituencies: ["Arunachal West", "Arunachal East"]
    },
    "Assam": {
        districts: ["Baksa", "Barpeta", "Bongaigaon", "Cachar", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Goalpara", "Golaghat", "Hailakandi", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "Tinsukia", "Udalguri"],
        constituencies: ["Karimganj", "Silchar", "Autonomous District", "Dhubri", "Kokrajhar", "Barpeta", "Gauhati", "Mangaldoi", "Nowgong", "Tezpur", "Jorhat", "Dibrugarh", "Lakhimpur", "Kaliabor"]
    },
    "Bihar": {
        districts: ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
        constituencies: ["Valmiki Nagar", "Paschim Champaran", "Purvi Champaran", "Sheohar", "Sitamarhi", "Madhubani", "Jhanjharpur", "Supaul", "Araria", "Kishanganj", "Katihar", "Purnia", "Madhepura", "Darbhanga", "Muzaffarpur", "Vaishali", "Gopalganj", "Siwan", "Maharajganj", "Saran", "Hajipur", "Ujiarpur", "Samastipur", "Begusarai", "Khagaria", "Bhagalpur", "Banka", "Munger", "Nalanda", "Patna Sahib", "Patliputra", "Arrah", "Buxar", "Sasaram", "Karakat", "Jahanabad", "Aurangabad", "Gaya", "Nawada", "Jamui"]
    },
    "Chhattisgarh": {
        districts: ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
        constituencies: ["Bastar", "Kanker", "Rajnandgaon", "Mahasamund", "Durg", "Raipur", "Bilaspur", "Janjgir-Champa", "Korba", "Surguja", "Raigarh"]
    },
    "Goa": {
        districts: ["North Goa", "South Goa"],
        constituencies: ["North Goa", "South Goa"]
    },
    "Gujarat": {
        districts: ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
        constituencies: ["Kachchh", "Banaskantha", "Patan", "Mahesana", "Sabarkantha", "Gandhinagar", "Ahmedabad East", "Ahmedabad West", "Surendranagar", "Rajkot", "Porbandar", "Jamnagar", "Junagadh", "Amreli", "Bhavnagar", "Anand", "Kheda", "Panchmahal", "Dahod", "Vadodara", "Chhota Udaipur", "Bharuch", "Bardoli", "Surat", "Navsari", "Valsad"]
    },
    "Haryana": {
        districts: ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
        constituencies: ["Ambala", "Kurukshetra", "Sirsa", "Hisar", "Karnal", "Sonipat", "Rohtak", "Bhiwani-Mahendragarh", "Gurgaon", "Faridabad"]
    },
    "Himachal Pradesh": {
        districts: ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
        constituencies: ["Kangra", "Mandi", "Hamirpur", "Shimla"]
    },
    "Jharkhand": {
        districts: ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahebganj", "Seraikela-Kharsawan", "Simdega", "West Singhbhum"],
        constituencies: ["Rajmahal", "Dumka", "Godda", "Chatra", "Kodarma", "Giridih", "Dhanbad", "Ranchi", "Jamshedpur", "Singhbhum", "Khunti", "Lohardaga", "Palamu", "Hazaribagh"]
    },
    "Karnataka": {
        districts: ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"],
        constituencies: ["Chikkodi", "Belgaum", "Bagalkot", "Bijapur", "Gulbarga", "Raichur", "Bidar", "Koppal", "Bellary", "Haveri", "Dharwad", "Uttara Kannada", "Davanagere", "Shimoga", "Udupi-Chikmagalur", "Hassan", "Dakshina Kannada", "Chitradurga", "Tumkur", "Mandya", "Mysore", "Chamarajanagar", "Bangalore Rural", "Bangalore North", "Bangalore Central", "Bangalore South", "Chikballapur", "Kolar"]
    },
    "Kerala": {
        districts: ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
        constituencies: ["Kasaragod", "Kannur", "Vatakara", "Wayanad", "Kozhikode", "Malappuram", "Ponnani", "Palakkad", "Alathur", "Thrissur", "Chalakudy", "Ernakulam", "Idukki", "Kottayam", "Alappuzha", "Mavelikkara", "Pathanamthitta", "Kollam", "Attingal", "Thiruvananthapuram"]
    },
    "Madhya Pradesh": {
        districts: ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
        constituencies: ["Morena", "Bhind", "Gwalior", "Guna", "Sagar", "Tikamgarh", "Damoh", "Khajuraho", "Satna", "Rewa", "Sidhi", "Shahdol", "Jabalpur", "Mandla", "Balaghat", "Chhindwara", "Hoshangabad", "Vidisha", "Bhopal", "Rajgarh", "Dewas", "Ujjain", "Mandsaur", "Ratlam", "Dhar", "Indore", "Khargone", "Khandwa", "Betul"]
    },
    "Maharashtra": {
        districts: ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
        constituencies: ["Nandurbar", "Dhule", "Jalgaon", "Raver", "Buldhana", "Akola", "Amravati", "Wardha", "Ramtek", "Nagpur", "Bhandara-Gondiya", "Gadchiroli-Chimur", "Chandrapur", "Yavatmal-Washim", "Hingoli", "Nanded", "Parbhani", "Jalna", "Aurangabad", "Dindori", "Nashik", "Palghar", "Bhiwandi", "Kalyan", "Thane", "Mumbai North", "Mumbai North West", "Mumbai North East", "Mumbai North Central", "Mumbai South Central", "Mumbai South", "Raigad", "Maval", "Pune", "Baramati", "Shirur", "Ahmednagar", "Shirdi", "Beed", "Osmanabad", "Latur", "Solapur", "Madha", "Sangli", "Satara", "Ratnagiri-Sindhudurg", "Kolhapur", "Hatkanangle"]
    },
    "Manipur": {
        districts: ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
        constituencies: ["Inner Manipur", "Outer Manipur"]
    },
    "Meghalaya": {
        districts: ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri-Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
        constituencies: ["Shillong", "Tura"]
    },
    "Mizoram": {
        districts: ["Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Saitual", "Serchhip"],
        constituencies: ["Mizoram"]
    },
    "Nagaland": {
        districts: ["Chumoukedima", "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Noklak", "Peren", "Phek", "Shamator", "Tuensang", "Wokha", "Zunheboto"],
        constituencies: ["Nagaland"]
    },
    "Odisha": {
        districts: ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Sonepur", "Sundargarh"],
        constituencies: ["Bargarh", "Sundargarh", "Sambalpur", "Keonjhar", "Mayurbhanj", "Balasore", "Bhadrak", "Jajpur", "Dhenkanal", "Bolangir", "Kalahandi", "Nabarangpur", "Kandhamal", "Cuttack", "Kendrapara", "Jagatsinghpur", "Puri", "Bhubaneswar", "Aska", "Berhampur", "Koraput"]
    },
    "Punjab": {
        districts: ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Malerkotla", "Mansa", "Moga", "Mohali", "Muktsar", "Nawanshahr", "Pathankot", "Patiala", "Rupnagar", "Sangrur", "Tarn Taran"],
        constituencies: ["Gurdaspur", "Amritsar", "Khadoor Sahib", "Jalandhar", "Hoshiarpur", "Anandpur Sahib", "Ludhiana", "Fatehgarh Sahib", "Faridkot", "Firozpur", "Bathinda", "Sangrur", "Patiala"]
    },
    "Rajasthan": {
        districts: ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
        constituencies: ["Ganganagar", "Bikaner", "Churu", "Jhunjhunu", "Sikar", "Jaipur Rural", "Jaipur", "Alwar", "Bharatpur", "Karauli-Dholpur", "Dausa", "Tonk-Sawai Madhopur", "Ajmer", "Nagaur", "Pali", "Jodhpur", "Barmer", "Jalore", "Udaipur", "Banswara", "Chittorgarh", "Rajsamand", "Bhilwara", "Kota", "Jhalawar-Baran"]
    },
    "Sikkim": {
        districts: ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
        constituencies: ["Sikkim"]
    },
    "Tamil Nadu": {
        districts: ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
        constituencies: ["Thiruvallur", "Chennai North", "Chennai South", "Chennai Central", "Sriperumbudur", "Kancheepuram", "Arakkonam", "Vellore", "Krishnagiri", "Dharmapuri", "Tiruvannamalai", "Arani", "Villupuram", "Kallakurichi", "Salem", "Namakkal", "Erode", "Tiruppur", "Nilgiris", "Coimbatore", "Pollachi", "Dindigul", "Karur", "Tiruchirappalli", "Perambalur", "Cuddalore", "Chidambaram", "Mayiladuthurai", "Nagapattinam", "Thanjavur", "Sivaganga", "Madurai", "Theni", "Virudhunagar", "Ramanathapuram", "Thoothukudi", "Tenkasi", "Tirunelveli", "Kanyakumari"]
    },
    "Telangana": {
        districts: ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem", "Mahabubabad", "Mahbubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri"],
        constituencies: ["Adilabad", "Peddapalle", "Karimnagar", "Nizamabad", "Zahirabad", "Medak", "Malkajgiri", "Secunderabad", "Hyderabad", "Chevella", "Mahbubnagar", "Nagarkurnool", "Nalgonda", "Bhongir", "Warangal", "Mahabubabad", "Khammam"]
    },
    "Tripura": {
        districts: ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
        constituencies: ["Tripura West", "Tripura East"]
    },
    "Uttar Pradesh": {
        districts: ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Badaun", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bijnor", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kushinagar", "Lakhimpur Kheri", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
        constituencies: ["Saharanpur", "Kairana", "Muzaffarnagar", "Bijnor", "Nagina", "Moradabad", "Rampur", "Sambhal", "Amroha", "Meerut", "Baghpat", "Ghaziabad", "Gautam Buddha Nagar", "Bulandshahr", "Aligarh", "Hathras", "Mathura", "Agra", "Fatehpur Sikri", "Firozabad", "Mainpuri", "Etah", "Badaun", "Aonla", "Bareilly", "Pilibhit", "Shahjahanpur", "Kheri", "Dhaurahra", "Sitapur", "Hardoi", "Misrikh", "Unnao", "Mohanlalganj", "Lucknow", "Raebareli", "Amethi", "Sultanpur", "Pratapgarh", "Phulpur", "Allahabad", "Barabanki", "Faizabad", "Ambedkar Nagar", "Bahraich", "Kaiserganj", "Shravasti", "Gonda", "Domariyaganj", "Basti", "Sant Kabir Nagar", "Maharajganj", "Gorakhpur", "Kushi Nagar", "Deoria", "Bansgaon", "Lalganj", "Azamgarh", "Ghosi", "Salempur", "Ballia", "Jaunpur", "Machhlishahr", "Ghazipur", "Chandauli", "Varanasi", "Bhadohi", "Mirzapur", "Robertsganj", "Banda", "Fatehpur", "Kaushambi", "Jhansi", "Hamirpur", "Jalaun", "Etawah", "Farrukhabad", "Kannauj", "Kanpur", "Akbarpur"]
    },
    "Uttarakhand": {
        districts: ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
        constituencies: ["Tehri Garhwal", "Garhwal", "Almora", "Nainital-Udhamsingh Nagar", "Haridwar"]
    },
    "West Bengal": {
        districts: ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"],
        constituencies: ["Cooch Behar", "Alipurduars", "Jalpaiguri", "Darjeeling", "Raiganj", "Balurghat", "Maldaha Uttar", "Maldaha Dakshin", "Jangipur", "Baharampur", "Murshidabad", "Krishnanagar", "Ranaghat", "Bangaon", "Barrackpore", "Dum Dum", "Barasat", "Basirhat", "Joynagar", "Mathurapur", "Diamond Harbour", "Jadavpur", "Kolkata Dakshin", "Kolkata Uttar", "Howrah", "Uluberia", "Srerampur", "Hooghly", "Arambagh", "Tamluk", "Kanthi", "Ghatal", "Jhargram", "Medinipur", "Purulia", "Bankura", "Bishnupur", "Bardhaman Purba", "Bardhaman-Durgapur", "Asansol", "Bolpur", "Birbhum"]
    },
    "Delhi": {
        districts: ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
        constituencies: ["Chandni Chowk", "North East Delhi", "East Delhi", "New Delhi", "North West Delhi", "West Delhi", "South Delhi"]
    },
    "Jammu and Kashmir": {
        districts: ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"],
        constituencies: ["Baramulla", "Srinagar", "Anantnag-Rajouri", "Udhampur", "Jammu"]
    }
};
