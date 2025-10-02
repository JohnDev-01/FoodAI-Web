import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';

export function About() {
  const team = [
    {
      name: 'John Doe',
      role: 'CEO & Founder',
      bio: 'Passionate about using technology to improve nutrition and health outcomes.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    },
    {
      name: 'Jane Smith',
      role: 'Head of AI',
      bio: 'Expert in machine learning and nutrition science with 10+ years of experience.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    },
    {
      name: 'Mike Johnson',
      role: 'Lead Developer',
      bio: 'Full-stack developer focused on creating intuitive and scalable applications.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    },
  ];

  const values = [
    {
      title: 'Innovation',
      description: 'We continuously push the boundaries of what\'s possible with AI and nutrition technology.',
      icon: '💡',
    },
    {
      title: 'Health First',
      description: 'Every decision we make is guided by our commitment to improving people\'s health and wellbeing.',
      icon: '❤️',
    },
    {
      title: 'Accessibility',
      description: 'We believe everyone should have access to personalized nutrition guidance, regardless of their background.',
      icon: '🌍',
    },
    {
      title: 'Science-Based',
      description: 'Our recommendations are grounded in the latest nutrition science and research.',
      icon: '🔬',
    },
  ];

  return (
    <div className="py-20 px-4">
      <div className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              About FoodAI
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              We're on a mission to revolutionize how people approach nutrition and food choices 
              through the power of artificial intelligence and personalized recommendations.
            </p>
          </div>

          {/* Mission Section */}
          <section className="mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  To make personalized nutrition accessible to everyone by leveraging cutting-edge AI technology 
                  to provide accurate, science-based recommendations that help people make better food choices 
                  and achieve their health goals.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Values Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="text-4xl mb-4">{value.icon}</div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Team Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
              Meet Our Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardTitle className="text-xl">{member.name}</CardTitle>
                    <CardDescription className="text-blue-600 dark:text-blue-400 font-medium">
                      {member.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">
                      {member.bio}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Story Section */}
          <section className="mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Our Story</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  FoodAI was born from a simple observation: despite having access to more nutrition 
                  information than ever before, people are still struggling to make healthy food choices. 
                  The problem isn't lack of information—it's the overwhelming amount of conflicting advice 
                  and one-size-fits-all recommendations.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  We realized that what people needed wasn't more generic advice, but personalized 
                  recommendations that take into account their unique preferences, dietary restrictions, 
                  health goals, and lifestyle. That's where AI comes in.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  By combining machine learning with comprehensive nutrition databases and user behavior 
                  analysis, we can provide truly personalized food recommendations that adapt and improve 
                  over time. Our goal is to make healthy eating not just easier, but more enjoyable and 
                  sustainable for everyone.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Contact Section */}
          <section className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Have questions or want to learn more about FoodAI? We'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:hello@foodai.com"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Contact Us
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              >
                Join Our Newsletter
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}



