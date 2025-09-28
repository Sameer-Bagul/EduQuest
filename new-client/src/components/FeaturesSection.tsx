import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle, Star, BarChart3, Shield, Clock, Palette, Brain, Trophy, Heart, Zap, Globe } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Evaluation",
      description: "Advanced NLP algorithms provide instant, accurate feedback on voice and text responses.",
      badge: "Smart",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Real-time Proctoring",
      description: "Secure assignment environment with activity monitoring and integrity checks.",
      badge: "Secure",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Beautiful Analytics",
      description: "Comprehensive insights and progress tracking for educators and students.",
      badge: "Insights",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Time Management",
      description: "Built-in timers and deadline management to keep students on track.",
      badge: "Efficient",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Beautiful Interface",
      description: "Intuitive, modern design that makes learning enjoyable and engaging.",
      badge: "Modern",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Multi-language Support",
      description: "Support for multiple languages and international educational standards.",
      badge: "Global",
      color: "from-cyan-500 to-blue-500"
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-700 dark:text-blue-300 border-0">
            <Star className="w-4 h-4 mr-2" />
            Why Choose EduQuest?
          </Badge>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-gray-900 dark:text-white">
            Powerful Features for
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600"> Modern Education</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Everything you need to create, manage, and evaluate digital assignments with cutting-edge technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover-lift edu-card border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-all duration-300`}>
                  {feature.icon}
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="flex items-center mt-6 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Ready to use
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}