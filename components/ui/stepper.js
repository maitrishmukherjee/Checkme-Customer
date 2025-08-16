import { Check } from "lucide-react"
import { cn } from "../../lib/utils"

export function Stepper({ steps, currentStep }) {
    return (
        <div className="w-full">
            <div className="flex items-start">
                {steps.map((step, index) => {
                    const stepNumber = index + 1
                    const isCompleted = stepNumber < currentStep
                    const isCurrent = stepNumber === currentStep
                    const isUpcoming = stepNumber > currentStep
                    const isFirstStep = index === 0
                    const isLastStep = index === steps.length - 1

                    return (
                        <div key={step.id} className="flex flex-col items-center flex-1">
                            <div className="flex items-center w-full">
                                {/* Line before the current step, only if not the first step */}
                                {!isFirstStep && (
                                    <div
                                        className={cn("flex-1 border-t-2 transition duration-500 ease-in-out", {
                                            "border-blue-500": isCompleted || (isCurrent && index > 0),
                                            "border-gray-300": !isCompleted && !(isCurrent && index > 0),
                                        })}
                                    />
                                )}
                                {isFirstStep && <div className="flex-1"></div>}
                                <div
                                    className={cn(
                                        "flex items-center justify-center h-9 w-9 rounded-full border-2 transition duration-500 ease-in-out flex-shrink-0",
                                        {
                                            "bg-blue-500 border-blue-500 text-white": isCompleted,
                                            "bg-blue-50 border-blue-500 text-blue-500": isCurrent,
                                            "bg-transparent border-gray-300 text-gray-400": isUpcoming,
                                        },
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="w-6 h-6" />
                                    ) : (
                                        <div
                                            className={cn(
                                                "h-4 w-4 rounded-full border-2",
                                                {
                                                    "border-blue-500 bg-transparent": isCurrent,
                                                    "border-gray-300 bg-transparent": isUpcoming,
                                                },
                                            )}
                                        ></div>
                                    )}
                                </div>
                                {!isLastStep && (
                                    <div
                                        className={cn("flex-1 border-t-2 transition duration-500 ease-in-out", {
                                            "border-blue-500": isCompleted,
                                            "border-gray-300": !isCompleted,
                                        })}
                                    />
                                )}
                                {isLastStep && <div className="flex-1"></div>}
                            </div>
                            <div className="mt-3 text-center w-30 min-h-[40px] flex flex-col justify-start">
                                <p
                                    className={cn("text-sm font-medium transition-colors duration-300 leading-tight", {
                                        "text-gray-900": isCompleted || isCurrent,
                                        "text-gray-500": isUpcoming,
                                    })}
                                >
                                    {step.title}
                                </p>
                                {/* {step.subtitle && (
                                    <p
                                        className={cn("text-sm font-medium transition-colors duration-300 leading-tight", {
                                            "text-gray-900": isCompleted || isCurrent,
                                            "text-gray-500": isUpcoming,
                                        })}
                                    >
                                        {step.subtitle}
                                    </p>
                                )} */}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
