export default function About() {

    const testEngineVersion = process.env.NEXTAUTH_URL;

    console.log(testEngineVersion);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About</h1>
          <p className="text-xl text-gray-600">Learn more about our nutrition tracking app</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Welcome to Nutrition Tracker</h2>
            <p className="text-gray-700 mb-6">
              Our app helps you track your daily nutrition intake with ease. Monitor your calories, 
              macronutrients, and other important dietary information to maintain a healthy lifestyle.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Features</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Track calories, carbs, protein, and fat</li>
              <li>Monitor additional nutrients like fiber, sugar, and sodium</li>
              <li>Visual progress tracking with daily goals</li>
              <li>Easy-to-use food entry form</li>
              <li>Comprehensive daily nutrition statistics</li>
              <li>Local storage to keep your data private</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">How to Use</h3>
            <p className="text-gray-700">
              Simply add your meals throughout the day using the nutrition form. The app will 
              automatically calculate your daily totals and show your progress toward your goals.
              All data is stored locally on your device for privacy and convenience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
