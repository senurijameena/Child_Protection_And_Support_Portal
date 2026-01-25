import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const HowItWorksSection: React.FC = () => {
    const steps = [
        {
            number: '01',
            title: 'Submit Report / Request',
            description: 'File a case or request help through our secure portal. You can choose to remain anonymous.',
            icon: 'bi-file-earmark-plus'
        },
        {
            number: '02',
            title: 'System Review',
            description: 'Our system automatically verifies the report and prioritizes it based on urgency and severity.',
            icon: 'bi-clipboard-check'
        },
        {
            number: '03',
            title: 'Professional Assignment',
            description: 'Cases are instantly assigned to the appropriate police station or local social workers.',
            icon: 'bi-people'
        },
        {
            number: '04',
            title: 'Direct Action Taken',
            description: 'Authorities and professionals investigate and provide the necessary intervention and support.',
            icon: 'bi-shield-check'
        },
        {
            number: '05',
            title: 'Track Progress',
            description: 'Receive real-time notifications and track the status of your report through the dashboard.',
            icon: 'bi-graph-up-arrow'
        }
    ];

    return (
        <section className="py-28 bg-white" id="how-it-works">
            <Container>
                <div className="text-center mb-24 max-w-3xl mx-auto">
                    <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest text-indigo-600 uppercase bg-indigo-50 rounded-full">
                        Protocol & Process
                    </span>
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">How the Portal Functions</h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Our streamlined, multi-agency response system ensures every report is handled
                        with maximum efficiency and absolute confidentiality.
                    </p>
                </div>

                {/* Vertical Modern Timeline */}
                <div className="max-w-4xl mx-auto relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[31px] lg:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-100 via-blue-200 to-blue-100 hidden lg:block -translate-x-1/2"></div>

                    <div className="space-y-16">
                        {steps.map((step, index) => (
                            <div key={index} className={`relative flex flex-col lg:flex-row items-start lg:items-center gap-10 ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                                {/* Icon Orb */}
                                <div className="z-10 flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 bg-white border-4 border-blue-50 shadow-premium rounded-3xl flex items-center justify-center lg:absolute lg:left-1/2 lg:-translate-x-1/2 group hover:bg-blue-600 transition-colors duration-500">
                                    <i className={`bi ${step.icon} text-2xl lg:text-3xl text-blue-600 group-hover:text-white transition-colors`}></i>
                                </div>

                                {/* Content Card */}
                                <div className={`flex-grow w-full lg:w-[42%] group`}>
                                    <div className={`p-8 lg:p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 transition-all duration-500 hover:bg-white hover:shadow-premium hover:-translate-y-2 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                                        <div className={`flex items-center gap-3 mb-4 ${index % 2 === 0 ? 'lg:justify-end' : 'lg:justify-start'}`}>
                                            <span className="text-4xl font-black text-blue-100 group-hover:text-blue-200 transition-colors">{step.number}</span>
                                            <div className="h-[2px] w-8 bg-blue-200"></div>
                                        </div>
                                        <h4 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">{step.title}</h4>
                                        <p className="text-slate-600 leading-relaxed text-lg opacity-80 group-hover:opacity-100">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Spacer for desktop grid */}
                                <div className="hidden lg:block lg:w-[42%]"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default HowItWorksSection;
