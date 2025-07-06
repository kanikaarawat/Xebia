'use client';

import { useRouter } from 'next/navigation';
import { Brain, MessageCircle } from 'lucide-react';

export default function MentalHealthCards() {
    const router = useRouter();

    return (
        <div className="flex flex-col sm:flex-row gap-8">
            {/* MindMend Hub Card */}
            <div className="group relative bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-3xl p-8 flex-1 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100/50 hover:border-blue-200/50 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-blue-500/25 group-hover:scale-105 transition-all duration-300">
                        <Brain className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        MindMend Hub
                    </h2>
                    <p className="text-gray-600 mb-8 leading-relaxed text-sm">
                        Access personalized mental health resources, expert tools, and guided wellness programs
                    </p>
                    <button
                        onClick={() => {
                            document.title = "MindMend Hub – MindMend";
                            router.push('/mindmend-hub');
                        }}
                        className="group/btn inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                    >
                        Explore Resources
                        <div className="w-2 h-2 bg-white rounded-full group-hover/btn:animate-pulse" />
                    </button>
                </div>
            </div>

            {/* Chatroom Card */}
            <div className="group relative bg-gradient-to-br from-teal-50 via-white to-cyan-50 rounded-3xl p-8 flex-1 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-teal-100/50 hover:border-teal-200/50 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-teal-500/25 group-hover:scale-105 transition-all duration-300">
                        <MessageCircle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                        Chatroom
                    </h2>
                    <p className="text-gray-600 mb-8 leading-relaxed text-sm">
                        Connect with a supportive community, share experiences, and find encouragement in a safe, moderated environment
                    </p>
                    <button
                        onClick={() => window.location.href = 'https://finalworkingchatroom-production.up.railway.app/'}
                        className="group/btn inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium rounded-full hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-teal-500/25 hover:scale-105"
                    >
                        Join Community
                        <div className="w-2 h-2 bg-white rounded-full group-hover/btn:animate-pulse" />
                    </button>
                </div>
            </div>
        </div>
    );
}
