import { createSignal, For, onCleanup } from "solid-js";
import "./styles.css";

export default function AnniversaryPage() {
	// Our special date: June 20, 2025
	const startDate = new Date("2025-06-20T00:00:00");

	// Live counter using SolidJS primitives
	const [timeElapsed, setTimeElapsed] = createSignal(calculateTimeElapsed());

	function calculateTimeElapsed() {
		const now = new Date();
		const diff = now.getTime() - startDate.getTime();

		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((diff % (1000 * 60)) / 1000);

		return { days, hours, minutes, seconds };
	}

	// Update counter every second
	const interval = setInterval(() => {
		setTimeElapsed(calculateTimeElapsed());
	}, 1000);

	onCleanup(() => clearInterval(interval));

	// Timeline events - customize these with your real memories!
	const timelineEvents = [
		{
			date: "June 20, 2025",
			title: "The Day We Met",
			description: "Our story began...",
			image: "/photos/event1.jpg",
		},
		{
			date: "July 2025",
			title: "First Date",
			description: "An unforgettable evening...",
			image: "/photos/event2.jpg",
		},
		{
			date: "August 2025",
			title: "Made It Official",
			description: "The best decision ever...",
			image: "/photos/event3.jpg",
		},
		{
			date: "September 2025",
			title: "First Trip Together",
			description: "Adventures and memories...",
			image: "/photos/event4.jpg",
		},
		{
			date: "October 2025",
			title: "A Special Moment",
			description: "When we realized...",
			image: "/photos/event5.jpg",
		},
		{
			date: "December 2025",
			title: "Our First Holiday",
			description: "Creating traditions together...",
			image: "/photos/event6.jpg",
		},
		{
			date: "January 2026",
			title: "Another Milestone",
			description: "Growing stronger every day...",
			image: "/photos/event7.jpg",
		},
		{
			date: "Today",
			title: "Happy Anniversary",
			description: "Here's to many more memories together...",
			image: "/photos/event8.jpg",
		},
	];

	// Gallery photos - add your photo paths here
	const galleryPhotos = [
		"/photos/photo1.jpg",
		"/photos/photo2.jpg",
		"/photos/photo3.jpg",
		"/photos/photo4.jpg",
		"/photos/photo5.jpg",
		"/photos/photo6.jpg",
		"/photos/photo7.jpg",
		"/photos/photo8.jpg",
		"/photos/photo9.jpg",
	];

	// Slideshow state (for carousel option)
	const [currentSlide, setCurrentSlide] = createSignal(0);

	const nextSlide = () => {
		setCurrentSlide((prev) => (prev + 1) % galleryPhotos.length);
	};

	const prevSlide = () => {
		setCurrentSlide(
			(prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length,
		);
	};

	return (
		<div class="anniversary-page">
			{/* Hero Section with Counter */}
			<section class="hero">
				<div class="hero-background">
					<img src="/photos/hero.jpg" alt="Us together" class="hero-image" />
					<div class="hero-overlay"></div>
				</div>

				<div class="hero-content">
					<div class="hero-photo-frame">
						<img src="/photos/hero.jpg" alt="Us" class="hero-photo" />
					</div>

					<div class="hero-text">
						<h1 class="hero-title">us :)</h1>
						<p class="hero-subtitle">here's to all our adventures together</p>

						<div class="counter-text">
							<span class="counter-number">{timeElapsed().days}</span> days,{" "}
							<span class="counter-number">{timeElapsed().hours}</span> hours,{" "}
							<span class="counter-number">{timeElapsed().minutes}</span>{" "}
							minutes,{" "}
							<span class="counter-number">{timeElapsed().seconds}</span>{" "}
							seconds
						</div>

						<p class="counter-description">together (and counting!)</p>
					</div>
				</div>
			</section>

			{/* Timeline Section */}
			<section class="timeline-section">
				<h2 class="section-title">our story so far</h2>

				<div class="timeline">
					<For each={timelineEvents}>
						{(event, index) => (
							<div
								class="timeline-item"
								classList={{
									"timeline-item-left": index() % 2 === 0,
									"timeline-item-right": index() % 2 !== 0,
								}}
							>
								<div class="timeline-content">
									<div class="timeline-date">{event.date}</div>
									<h3 class="timeline-title">{event.title}</h3>
									<p class="timeline-description">{event.description}</p>
								</div>
								<div class="timeline-marker"></div>
							</div>
						)}
					</For>
				</div>
			</section>

			{/* PHOTO DISPLAY OPTIONS - Uncomment the one you want to use */}

			{/* OPTION 1: Gallery Grid (CURRENTLY ACTIVE) */}
			<section class="photos-section">
				<h2 class="section-title">some of my favorite pics of us</h2>
				<div class="photo-gallery">
					<For each={galleryPhotos}>
						{(photo) => (
							<div class="photo-item">
								<img src={photo} alt="Our memory" class="photo-image" />
								<div class="photo-overlay">
									<span class="photo-caption">A beautiful moment</span>
								</div>
							</div>
						)}
					</For>
				</div>
			</section>

			{/* OPTION 2: Timeline Integrated Photos */}
			{/* <section class="timeline-section">
        <h2 class="section-title">Our Journey Together</h2>
        
        <div class="timeline">
          <For each={timelineEvents}>
            {(event, index) => (
              <div class="timeline-item" classList={{ 'timeline-item-left': index() % 2 === 0, 'timeline-item-right': index() % 2 !== 0 }}>
                <div class="timeline-content">
                  <div class="timeline-image-container">
                    <img src={event.image} alt={event.title} class="timeline-image" />
                  </div>
                  <div class="timeline-date">{event.date}</div>
                  <h3 class="timeline-title">{event.title}</h3>
                  <p class="timeline-description">{event.description}</p>
                </div>
                <div class="timeline-marker"></div>
              </div>
            )}
          </For>
        </div>
      </section> */}

			{/* OPTION 3: Slideshow/Carousel */}
			{/* <section class="photos-section">
        <h2 class="section-title">Our Memories</h2>
        <div class="carousel">
          <button class="carousel-button carousel-button-prev" onClick={prevSlide}>
            ‹
          </button>
          <div class="carousel-container">
            <img 
              src={galleryPhotos[currentSlide()]} 
              alt="Our memory" 
              class="carousel-image" 
            />
          </div>
          <button class="carousel-button carousel-button-next" onClick={nextSlide}>
            ›
          </button>
          <div class="carousel-dots">
            <For each={galleryPhotos}>
              {(_, index) => (
                <button 
                  class="carousel-dot" 
                  classList={{ 'carousel-dot-active': currentSlide() === index() }}
                  onClick={() => setCurrentSlide(index())}
                />
              )}
            </For>
          </div>
        </div>
      </section> */}

			{/* OPTION 4: Scattered/Collage Style */}
			{/* <section class="photos-section">
        <h2 class="section-title">Our Memories</h2>
        <div class="photo-collage">
          <For each={galleryPhotos}>
            {(photo, index) => (
              <div 
                class="collage-item" 
                style={{
                  'grid-column': `span ${index() % 3 === 0 ? 2 : 1}`,
                  'grid-row': `span ${index() % 4 === 0 ? 2 : 1}`
                }}
              >
                <img src={photo} alt="Our memory" class="collage-image" />
                <div class="collage-overlay">
                  <span class="collage-caption">A beautiful moment</span>
                </div>
              </div>
            )}
          </For>
        </div>
      </section> */}

			{/* Footer Message */}
			<section class="footer-message">
				<h2 class="footer-title">i love you</h2>
				<p class="footer-text">
					thanks for all the laughs, adventures, late night talks, and
					everything in between. can't wait for all the memories we haven't made
					yet.
				</p>
				<div class="heart">♥</div>
			</section>
		</div>
	);
}
