import React, { useState, useEffect, useRef } from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "@tensorflow/tfjs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import './index.css'
import { UploadCloud, Image as ImageIcon, Loader2, CheckCircle2, AlertTriangle, Info, Sparkles, Trash2, RotateCcw, FileText, Ratio, MessageSquareWarning, Send, Lightbulb, Github } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function App() {
  const [model, setModel] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingModel, setLoadingModel] = useState(true);
  const imageRef = useRef(null);
  const [imageDetails, setImageDetails] = useState(null); // { name, size, type, dimensions }
  const [isDragging, setIsDragging] = useState(false);

  // New Features State
  const [currentFact, setCurrentFact] = useState("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [userCorrection, setUserCorrection] = useState("");

  useEffect(() => {
    async function loadModel() {
      try {
        console.log("Loading model...");
        const loadedModel = await mobilenet.load();
        setModel(loadedModel);
        console.log("Model loaded successfully");
      } catch (error) {
        console.error("Error loading model:", error);
        // Handle model loading error (e.g., show an error message to the user)
      } finally {
        setLoadingModel(false);
      }
    }
    loadModel();
  }, []);

  const processFile = (file) => {
    if (!file) return;

    // Optional: Add file type/size validation here
    // if (!file.type.startsWith('image/')) { ... }
    // if (file.size > 10 * 1024 * 1024) { ... } // 10MB limit

    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
    setResult(null); // Clear previous results when a new image is uploaded
    setCurrentFact(""); // Clear previous fact

    // Get image dimensions
    const img = new Image();
    img.onload = () => {
      setImageDetails({
        name: file.name,
        size: (file.size / 1024).toFixed(2), // size in KB
        type: file.type,
        dimensions: `${img.width} x ${img.height} px`,
      });
    };
    img.src = URL.createObjectURL(file);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
    // Reset file input to allow uploading the same file again if needed
    if (e.target) e.target.value = null;
  };
  
  const factsArray = [
    "Recycling one aluminum can save enough energy to run a TV for 3 hours.",
    "Glass can be recycled endlessly without losing quality or purity.",
    "Around 8 million metric tons of plastic are dumped into our oceans every year.",
    "Composting food scraps can reduce landfill waste by up to 30%.",
    "Recycling paper saves trees and reduces greenhouse gas emissions.",
    "The average person generates over 4 pounds of trash every day.",
    "E-waste contains valuable materials like gold and silver that can be recovered through recycling.",
    "Plastic bags can take up to 1,000 years to decompose in landfills.",
  ];

  const getRandomFact = () => {
    return factsArray[Math.floor(Math.random() * factsArray.length)];
  };

  const classifyImage = async () => {
    if (!model || !imageRef.current) return;

    setLoading(true);
    setResult(null);

    try {
      const predictions = await model.classify(imageRef.current);
      console.log("Predictions:", predictions);

      if (predictions && predictions.length > 0) {
        const top = predictions[0];
        const className = top.className.toLowerCase();
        const confidence = (top.probability * 100).toFixed(2);
        
        let tip = "Please refer to local recycling guidelines.";

        if (className.includes("bottle") || className.includes("plastic")) {
          tip = "Plastic bottles are often recyclable. Empty, rinse, and remove caps (check local rules if caps should be on or off).";
        } else if (className.includes("can") || className.includes("aluminum") || className.includes("tin")) {
          tip = "Metal cans are usually recyclable. Empty and rinse them before placing in the recycling bin.";
        } else if (className.includes("paper") || className.includes("cardboard")) {
          tip = "Clean paper and cardboard are widely recyclable. Flatten boxes. Avoid soiled paper (e.g., greasy pizza boxes).";
        } else if (className.includes("glass")) {
          tip = "Glass bottles and jars are recyclable. Rinse them and check if your local facility requires sorting by color.";
        } else if (className.includes("organic") || className.includes("food") || className.includes("compost")) {
          tip = "Organic waste like fruit peels or vegetable scraps can often be composted. Check for local composting programs.";
        }

        const classificationResult = { className: top.className.split(',')[0], confidence, tip };
        setResult(classificationResult);
        setCurrentFact(getRandomFact());

      } else {
        setResult({ className: "Unknown", confidence: "N/A", tip: "Could not classify the image. Please try a clearer image or a different item." });
        setCurrentFact("");
      }
    } catch (error) {
      console.error("Error classifying image:", error);
      setResult({ className: "Error", confidence: "N/A", tip: "An error occurred during classification." });
      setCurrentFact("");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
    // Clear the dataTransfer object
    if (e.dataTransfer.items) e.dataTransfer.items.clear(); else e.dataTransfer.clearData();
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!userCorrection.trim() || !result) return;
    console.log("Feedback Submitted:", {
      originalImage: imageSrc ? imageSrc.substring(0, 50) + "..." : "N/A", // Log snippet
      aiClassification: result.className,
      userCorrection: userCorrection,
    });
    // Here you would typically send this data to a backend
    setShowFeedbackForm(false);
    setUserCorrection("");
    // Optionally, update history item with user feedback
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 text-slate-700 flex flex-col items-center p-4 md:p-8 selection:bg-emerald-500/20">
      <header className="w-full max-w-3xl text-center py-8 md:py-12">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 opacity-75 blur-sm"></div>
            <div className="relative bg-white rounded-full p-2">
              <Sparkles className="h-12 w-12 md:h-16 md:w-16 text-emerald-500" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-800 ml-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">WasteWise</span> Classifier
          </h1>
        </div>
        <p className="text-lg md:text-xl text-slate-600 mt-2">
          Snap or upload an image to identify waste and get eco-friendly disposal tips
        </p>
      </header>

      {/* How It Works section - Arc Design */}
      <div className="w-full max-w-3xl mb-8">
        <h2 className="text-2xl font-medium text-emerald-800 mb-6 text-center">How It Works</h2>
        
        <div className="relative">
          {/* Arc Background */}
          <div className="hidden md:block absolute top-24 left-1/2 transform -translate-x-1/2 w-4/5 h-20 border-t-4 border-dashed border-emerald-200 rounded-t-full"></div>
          
          {/* Steps in Arc Formation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="bg-white shadow-md rounded-2xl p-5 border border-emerald-100 w-full">
                <div className="bg-emerald-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <UploadCloud className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="font-medium text-emerald-700 text-center mb-2">1. Upload an Image</h3>
                <p className="text-sm text-slate-600 text-center">Take a photo or upload an image of your waste item</p>
              </div>
              <div className="hidden md:block h-6 w-6 bg-emerald-500 rounded-full mt-4 relative z-10 shadow-sm border-2 border-white"></div>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="bg-white shadow-md rounded-2xl p-5 border border-teal-100 w-full">
                <div className="bg-teal-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="font-medium text-teal-700 text-center mb-2">2. AI Classification</h3>
                <p className="text-sm text-slate-600 text-center">Our AI analyzes and identifies the type of waste</p>
              </div>
              <div className="hidden md:block h-6 w-6 bg-teal-500 rounded-full mt-4 relative z-10 shadow-sm border-2 border-white"></div>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="bg-white shadow-md rounded-2xl p-5 border border-sky-100 w-full">
                <div className="bg-sky-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Info className="h-8 w-8 text-sky-600" />
                </div>
                <h3 className="font-medium text-sky-700 text-center mb-2">3. Get Recycling Tips</h3>
                <p className="text-sm text-slate-600 text-center">Learn how to properly dispose or recycle the item</p>
              </div>
              <div className="hidden md:block h-6 w-6 bg-sky-500 rounded-full mt-4 relative z-10 shadow-sm border-2 border-white"></div>
            </div>
          </div>
        </div>
      </div>

      <main className={`w-full mx-auto flex flex-col gap-6 px-4 md:px-0 ${
        result && !loading 
          ? 'max-w-6xl lg:flex-row items-start' 
          : 'max-w-xl items-center' 
      }`}>
        {/* Left Column: Image Upload Card */}
        <Card className={`w-full shadow-xl rounded-xl overflow-hidden bg-white/90 backdrop-blur-lg border-emerald-200/50 ${
          result && !loading ? 'lg:w-3/5' : ''
        }`}>
          <CardContent className="p-6 md:p-8 space-y-6">
            {loadingModel ? (
              <div className="flex flex-col items-center justify-center space-y-6 py-12 text-center">
                <div className="relative w-full h-3 max-w-md mx-auto overflow-hidden rounded-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-200 via-teal-200 to-emerald-200 opacity-30"></div>
                  <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-loadingSlide"></div>
                </div>
                <p className="text-xl font-medium text-emerald-700">Preparing the AI Model</p>
                <p className="text-sm text-slate-600 max-w-md">This might take a few moments. We're getting everything ready to help you identify and recycle waste properly.</p>
                <style jsx>{`
                  @keyframes loadingSlide {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(400%); }
                    100% { transform: translateX(-100%); }
                  }
                `}</style>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <Label htmlFor="picture-upload" className="text-lg font-semibold text-slate-700 sr-only">
                    Upload Waste Image
                  </Label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative group flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out
                      ${isDragging ? 'border-emerald-500 bg-emerald-50/80 scale-105' : imageSrc ? 'border-emerald-400/60 bg-emerald-50/50' : 'border-slate-300 hover:border-emerald-400/50 hover:bg-emerald-50/30'}`}
                  >
                    <input
                      id="picture-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={loading || loadingModel}
                    />
                    {imageSrc ? (
                      <div className="text-center w-full space-y-4">
                        <img
                          ref={imageRef}
                          src={imageSrc}
                          alt="Preview"
                          className="max-w-full max-h-60 md:max-h-72 object-contain rounded-lg mx-auto shadow-md border border-emerald-100"
                        />
                        {imageDetails && (
                          <div className="text-xs text-slate-600 mt-3 space-y-0.5 bg-emerald-50/90 p-2.5 rounded-lg border border-emerald-200/50">
                            <p className="flex items-center"><FileText className="h-3.5 w-3.5 mr-1.5 text-emerald-600/70" /> {imageDetails.name} ({imageDetails.size} KB)</p>
                            <p className="flex items-center"><Ratio className="h-3.5 w-3.5 mr-1.5 text-emerald-600/70" /> Dimensions: {imageDetails.dimensions}</p>
                          </div>
                        )}
                        <div className="flex justify-center items-center gap-2 sm:gap-3 mt-3">
                          <Button asChild variant="outline" size="lg" disabled={loading} className="group/btn border-emerald-200 hover:bg-emerald-50/50 text-emerald-700">
                            <Label htmlFor="picture-upload" className="cursor-pointer flex items-center">
                              <RotateCcw className="mr-2 h-5 w-5 transition-transform group-hover/btn:rotate-[-90deg]" /> Change Image
                            </Label>
                          </Button>
                          <Button variant="ghost" size="lg" onClick={() => { 
                            setImageSrc(null); 
                            setResult(null); 
                            setImageDetails(null);
                            setCurrentFact("");
                            setShowFeedbackForm(false);
                            setUserCorrection("");
                            if(imageRef.current) imageRef.current.src = ''; 
                          }} disabled={loading} className="text-red-500 hover:text-red-600 hover:bg-red-50/30">
                            <Trash2 className="mr-2 h-5 w-5" /> Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Label
                        htmlFor="picture-upload"
                        className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-center p-6 space-y-3"
                      >
                        <UploadCloud className="h-16 w-16 text-emerald-300 group-hover:text-emerald-500 transition-colors" />
                        <p className="text-lg font-medium text-slate-600 group-hover:text-emerald-600 transition-colors pointer-events-none">
                          <span className="font-semibold text-emerald-600">Browse files</span> or drag & drop
                        </p>
                        <p className="text-sm text-slate-500">Supports: PNG, JPG, GIF (Max 10MB)</p>
                      </Label>
                    )}
                  </div>
                </div>

                {imageSrc && (
                  <Button
                    onClick={classifyImage}
                    disabled={loading || !imageSrc || loadingModel}
                    className="w-full text-xl py-7 rounded-lg shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all duration-300"
                    size="lg"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="relative w-6 h-4 mr-3">
                          <div className="absolute top-0 w-1.5 h-1.5 rounded-full bg-white animate-loading1"></div>
                          <div className="absolute top-0 left-2.5 w-1.5 h-1.5 rounded-full bg-white animate-loading2"></div>
                          <div className="absolute top-0 left-5 w-1.5 h-1.5 rounded-full bg-white animate-loading3"></div>
                          <style jsx>{`
                            @keyframes loading1 {
                              0%, 100% { transform: translateY(0); opacity: 1; }
                              50% { transform: translateY(10px); opacity: 0.5; }
                            }
                            @keyframes loading2 {
                              0%, 100% { transform: translateY(0); opacity: 1; }
                              50% { transform: translateY(10px); opacity: 0.5; }
                            }
                            @keyframes loading3 {
                              0%, 100% { transform: translateY(0); opacity: 1; }
                              50% { transform: translateY(10px); opacity: 0.5; }
                            }
                            .animate-loading1 {
                              animation: loading1 1s infinite 0s;
                            }
                            .animate-loading2 {
                              animation: loading2 1s infinite 0.2s;
                            }
                            .animate-loading3 {
                              animation: loading3 1s infinite 0.4s;
                            }
                          `}</style>
                        </div>
                        Classifying...
                      </div>
                    ) : (
                      <>✨ Classify My Waste!</>
                    )}
                  </Button>
                )}

                {loading && (
                  <div className="relative w-full h-2.5 mt-3 overflow-hidden rounded-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-200 via-teal-200 to-sky-200 rounded-full"></div>
                    <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse-width"></div>
                    <style jsx>{`
                      @keyframes pulse-width {
                        0% { width: 0%; }
                        50% { width: 70%; }
                        100% { width: 90%; }
                      }
                      .animate-pulse-width {
                        animation: pulse-width 2s ease-in-out forwards;
                      }
                    `}</style>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Results and Facts - only shows if there's a result and not loading */}
        {result && !loading && (
          <div className="w-full lg:w-2/5 flex flex-col gap-6">
            {/* Classification Result */}
            <Alert className="w-full border-emerald-300/40 bg-emerald-50/90 shadow-md rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <AlertTitle className="text-xl font-semibold text-emerald-700 mb-3">Classification Complete!</AlertTitle>
              <AlertDescription className="space-y-3 text-base text-slate-700/90">
                  <div>
                    <strong className="font-medium text-slate-700">Identified as:</strong>{' '}
                    <span className="capitalize font-semibold text-emerald-600">{result.className}</span>
                  </div>
                  <div>
                    <strong className="font-medium text-slate-700">Confidence:</strong>{' '}
                    <span className="font-semibold text-emerald-600">{result.confidence}%</span>
                  </div>
                  <div className="pt-2">
                    <strong className="font-medium text-slate-700 flex items-center">
                      <Info className="h-5 w-5 mr-2 text-emerald-600/80" />
                      Recycling Tip:
                    </strong>
                    <p className="mt-1 pl-1 text-slate-600/90">{result.tip}</p>
                  </div>
                  <p className="text-sm text-slate-700 pt-3 italic">
                    <strong className="font-semibold">Disclaimer:</strong> AI-generated suggestion. Always verify with local recycling regulations.
                  </p>
                  {!showFeedbackForm && (
                    <TooltipProvider>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="sm" className="mt-4 w-full sm:w-auto border-emerald-300 text-emerald-700 hover:bg-emerald-50/70" onClick={() => setShowFeedbackForm(true)}>
                            <MessageSquareWarning className="mr-2 h-4 w-4" /> Report Misclassification
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Help improve our AI if the classification seems incorrect.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {showFeedbackForm && (
                    <form onSubmit={handleFeedbackSubmit} className="mt-4 space-y-3 p-4 border border-emerald-200/80 rounded-md bg-emerald-50/85">
                      <Label htmlFor="userCorrection" className="font-semibold text-sm text-slate-700">What do you think this item is?</Label>
                      <input
                        id="userCorrection"
                        type="text"
                        value={userCorrection}
                        onChange={(e) => setUserCorrection(e.target.value)}
                        placeholder="e.g., Plastic Lid, Cardboard Box"
                        className="w-full p-2 border border-emerald-200 rounded-md text-sm focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700"><Send className="mr-2 h-4 w-4" /> Submit Feedback</Button>
                        <Button type="button" variant="ghost" size="sm" className="text-slate-600" onClick={() => {setShowFeedbackForm(false); setUserCorrection("");}}>Cancel</Button>
                      </div>
                    </form>
                  )}
              </AlertDescription>
            </Alert>

            {/* Fact Card */}
            {currentFact && (
              <Card className="w-full bg-teal-50/90 backdrop-blur-md border border-teal-200/80 shadow-lg rounded-lg">
                <CardHeader className="p-4 pb-2">
                  <strong className="font-medium text-teal-700 flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-teal-500" />
                    Did you know?
                  </strong>
                  <p className="mt-1 pl-1 text-sm text-teal-600/90 italic">{currentFact}</p>
                </CardHeader>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* GitHub link */}
      <footer className="fixed bottom-4 right-4 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-white/80 hover:bg-white/90 backdrop-blur-md shadow-lg border border-emerald-200/50 rounded-full px-3 py-1.5 transition-colors cursor-pointer">
                <a href="https://github.com/DhruvR-16/wastewise-classifier" target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-slate-700 hover:text-emerald-700">
                  <Github className="h-4 w-4 mr-1.5" />
                  View on GitHub
                </a>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" align="start" className="bg-white text-slate-800 text-xs border border-emerald-200/50 rounded-md px-2 py-1 shadow-lg">
              <p>Access Waste Classifier Model</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </footer>

      
    </div>
  );
}

export default App;