CXX = g++
CXXFLAGS = -std=c++17 -I include -pthread
TARGET = bankserver
SRCS = $(filter-out src/main2.cpp, $(wildcard src/*.cpp))

.PHONY: build run clean

build:
	$(CXX) $(CXXFLAGS) -o $(TARGET) $(SRCS)

run: build
	./$(TARGET)

clean:
	rm -f $(TARGET)
