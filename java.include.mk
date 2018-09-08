JAVAC := javac

JAVA_SRCS := $(wildcard *.java)

JAVA_CLASSES := ${JAVA_SRCS:.java=.class}

.PHONY: all

clean:
	@rm -f *.class

%.class: %.java
	${JAVAC} $<

all:
	javac $(wildcard *.java)
