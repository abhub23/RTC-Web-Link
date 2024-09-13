import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Users, Globe, Shield, Zap, ChevronRight } from 'lucide-react';
import "../index.css";
import Loader from '../components/Loader'; // Import your Loader component
import { v4 as uuidv4 } from 'uuid'; // Import the UUID library

const Homepage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const start = () => {
        navigate('/start');
    };

    const price = () => {
        navigate('/price');
    };

    const contact = () => {
        setLoading(true); // Set loading to true before navigation
        setTimeout(() => {
            navigate('/contact');
            setLoading(false); // Hide loading spinner after navigation
        }, 2000); // Display loader for 2 seconds
    };

    const joinVideoConference = () => {
        const roomId = uuidv4(); // Generate a unique room ID
        navigate(`/video-conference/${roomId}`);
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
            <header className="bg-gray-800/50 backdrop-blur-md border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <Video className="h-8 w-8 text-cyan-400" />
                        <span className="ml-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Web Link</span>
                    </div>
                    <nav>
                        <ul className="flex space-x-6">
                            <li>
                                <a href="#" className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 cursor-pointer">
                                    Features
                                </a>
                            </li>
                            <li>
                                <a onClick={price} className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 cursor-pointer">
                                    Pricing
                                </a>
                            </li>
                            <li>
                                <a onClick={contact} className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 cursor-pointer">
                                    Contact
                                </a>
                            </li>
                            <li>
                                <a onClick={joinVideoConference} className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 cursor-pointer">
                                    Video Conference
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>
            
            <main className="flex-grow">
                <section className="py-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20 animate-pulse"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <h1 className="text-5xl font-extrabold sm:text-6xl md:text-7xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                            Connect Across Dimensions
                        </h1>
                        <p className="mt-3 max-w-md mx-auto text-xl text-gray-300 sm:text-2xl md:mt-5 md:max-w-3xl">
                            Experience holographic-quality video calls with Web Link. Transcend space and time to connect like never before.
                        </p>
                        <div className="mt-10 max-w-md mx-auto sm:flex sm:justify-center md:mt-12">
                            <div className="rounded-md shadow">
                                <a href="#" onClick={start} className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 md:py-4 md:text-lg md:px-10 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50">
                                    Initiate Link <Zap className="ml-2 h-5 w-5" />
                                </a>
                            </div>
                            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                                <a href="#" className="w-full flex items-center justify-center px-8 py-3 border border-cyan-400 text-base font-medium rounded-md text-cyan-400 bg-gray-800 hover:bg-gray-700 md:py-4 md:text-lg md:px-10 transition-all duration-300">
                                    Explore More <ChevronRight className="ml-2 h-5 w-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20 bg-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-4xl font-extrabold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            Why Choose Web Link?
                        </h2>
                        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { icon: Video, title: "Holographic Video*", description: "Ultra-high definition for an immersive experience." },
                                { icon: Users, title: "Multi-Dimensional Calls*", description: "Connect across parallel universes simultaneously." },
                                { icon: Globe, title: "Quantum Reach*", description: "Instant connection to any point in the cosmos." },
                                { icon: Shield, title: "Quantum Encryption*", description: "Unbreakable security for your interstellar privacy." }
                            ].map((feature, index) => (
                                <div key={index} className="text-center bg-gray-700/50 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:transform hover:scale-105 hover:bg-gray-700/80 border border-gray-600 hover:border-cyan-400">
                                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-900 mx-auto mb-4">
                                        <feature.icon className="h-8 w-8" />
                                    </div>
                                    <h3 className="mt-5 text-xl font-medium text-cyan-400">{feature.title}</h3>
                                    <p className="mt-2 text-base text-gray-300">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-20 bg-gray-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-4xl font-extrabold sm:text-5xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            Ready to Transcend?
                        </h2>
                        <p className="mt-4 text-xl text-gray-300">
                            Sign up now and revolutionize your intergalactic communications.
                        </p>
                        <div className="mt-10 flex justify-center">
                            <div className="inline-flex rounded-md shadow">
                                <a href="#" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-gray-900 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50">
                                    Activate Free Trial <Zap className="ml-2 h-5 w-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-gray-800 border-t border-gray-700">
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-gray-400">
                        © 2024 Web Link. (Some features are not available at the moment the website is under Development), *Features are not legit
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default Homepage;
